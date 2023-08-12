그동안 뻘글을 많이 썼을 수도 있었는데 안 쓴 이유 중 하나는 마크다운으로 작성한 글을 html로 바꾸는 수작업이 귀찮아서다. 자꾸 이렇게 마크다운 파서를 개발할 때까지 기다리기면서 글쓰기를 미루기 보다는 본연의 목적인 글쓰는 걸 우선시 하기 위해 그냥 오픈소스 라이브러리를 사용하기로 결정했다. [micromark](https://github.com/micromark/micromark)라는 라이브러리인데 많고 많은 markdown to html 라이브러리 중에서 이걸 선택한 이유는 딱히 없다.

```typescript
// 기존
Deno.readTextFile(`${cwd}/posts/${slug}/post.html`)
	.then((content) => {
		const post = PostTemplate({
			title,
			date,
			content,
		});
		// ...
	});

// 적용 후
Deno.readTextFile(`${cwd}/posts/${slug}/post.md`)
	.then((md) => {
		const content = micromark(md);
		const post = PostTemplate({
			title,
			date,
			content,
		});
		// ...
	});
```

이제는 글을 마음껏 편하게 쓸 수 있을 것 같아서 좋다.
