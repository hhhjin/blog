import { micromark } from "https://esm.sh/micromark@4.0.0";
import { parse } from "npm:yaml";
import { crypto, toHashString } from "std/crypto/mod.ts";

type Post = {
	title: string;
	slug: string;
	date: string;
	hashed: string;
};

let posts: Post[];

try {
	const postsJson = await Deno.readTextFile("generated/posts.json");
	posts = JSON.parse(postsJson);
} catch (error) {
	posts = [];
}

const newPosts: Post[] = [];

for await (const dirEntry of Deno.readDir("posts")) {
	if (dirEntry.name.startsWith(".")) continue;

	const md = await Deno.readTextFile(`posts/${dirEntry.name}/post.md`);

	let i = -1;
	let c = "", rawMatters = "";
	let end = 0;

	while (true) {
		c = md[++i];

		if (i > 3) {
			if (c === "-") end += 1;
			else {
				rawMatters += "-".repeat(end) + c;
				end = 0;
			}

			if (end === 3) break;
		}
	}

	const matters = parse(rawMatters) as {
		title: string;
		slug: string;
		date: string;
	};

	if (!matters.title || !matters.slug || !matters.date) {
		throw new Error("title, slug, date needed");
	}

	const hashed = toHashString(
		await crypto.subtle.digest(
			"MD4",
			new TextEncoder().encode(md),
		),
	);

	const post = posts.find((p) => p.slug === matters.slug);

	if (post && post.hashed === hashed) {
		newPosts.push(post);
		console.log(`${matters.title} 변경 없음`);
		continue;
	}

	const html = micromark(md.slice(i + 1));

	newPosts.push({
		title: matters.title,
		slug: matters.slug,
		date: matters.date,
		hashed,
	});

	await Deno.create(`generated/posts/${matters.slug}.html`);
	await Deno.writeTextFile(`generated/posts/${matters.slug}.html`, html);

	console.log(`${matters.title} 글 추가됨`);
}

await Deno.writeTextFile("generated/posts.json", JSON.stringify(newPosts));
