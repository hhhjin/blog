---
title: dev.log[4]
slug: dev-log-4
date: 2023-08-17
---

기존 블로그에서는 마크다운으로 작성한 글을 `posts` 디렉토리에 넣어두면 런타임 때 모든 `.md` 파일을 읽어 HTML로 생성해 놓고 메모리에 적재시켜 놓는 방식이었다. 이번엔 이 방식에서 단지 HTML을 생성하는 과정을 런타임에서 빌드타임으로 순서를 당기고 `metadata.json`으로 관리하던 글 정보를 `.md`안에 작성하는 `frontmatter`를 적용했다.

### 기존

```typescript
// src/pages/post.ts
for await (const dirEntry of Deno.readDir("posts")) {
	const meta = await Deno.readTextFile(
		`posts/${dirEntry.name}/metadata.json`,
	);
	const md = await Deno.readTextFile(`posts/${dirEntry.name}/post.md`);
	const html = markdown(md);
	// ...
}
```

### 변경 후

```typescript
// scripts/generate-posts.ts
const posts = [];

for await (const dirEntry of Deno.readDir("posts")) {
	const md = await Deno.readTextFile(`posts/${dirEntry.name}/post.md`);
	const { html, matters } = markdown(md);
	await Deno.writeTextFile(`generated/posts/${matters.slug}.html`, html);
	posts.push({
		title: matters.title,
		slug: matters.slug,
		date: matters.date,
	});
}

await Deno.writeTextFile("generated/posts.json", JSON.stringify(posts));
```

```typescript
// src/pages/post.ts
const posts = JSON.parse(await Deno.readTextFile("generated/posts.json"));

for (const post of posts) {
	const html = await Deno.readTextFile(`generated/posts/${post.slug}.html`);
	// ...
}
```

대부분의 코드를 `scripts/generate-posts.ts`로 옮겨 `pages/post.ts`에서는 html만 신경쓰도록 관심도를 분리했다.

여기에 추가적으로 각 글에 고유한 해시값을 부여하는 기능을 추가했다. 글 내용이 변하면 해시값도 바뀌어서 글 내부 내용이 변했는지 파악할 수 있어서 불필요한 생성을 막고 나중에는 HTTP Cache에 써먹을 생각이다.

```typescript
// scripts/generate-posts.ts
const posts = await Deno.readTextFile("generated/posts.json");
const newPosts = [];

for await (const dirEntry of Deno.readDir("posts")) {
	// ...
	const hashed = hash(md, "md4");
	const post = posts.find((p) => p.slug === matters.slug);

	// 해시값 비교 후 일치하면 패스
	if (post && post.hashed === hashed) {
		newPosts.push(post);
		continue;
	}

	// ...
}

// newPosts로 덮어쓰기
await Deno.writeTextFile("generated/posts.json", JSON.stringify(newPosts));
```
