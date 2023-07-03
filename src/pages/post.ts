import { PostTemplate } from "../templates/post.ts";

const posts = new Map<string, string>();
const cwd = Deno.cwd();

for await (const dirEntry of Deno.readDir(`${cwd}/posts`)) {
	if (dirEntry.name.startsWith(".")) continue;

	const slug = dirEntry.name;

	const meta = await Deno.readTextFile(`${cwd}/posts/${slug}/metadata.json`);
	const { title, date } = JSON.parse(meta);

	const content = await Deno.readTextFile(`${cwd}/posts/${slug}/post.html`);
	const post = PostTemplate({
		title,
		date,
		content,
	});

	posts.set(slug, post);
}

export function PostPage({ slug }: { slug: string }) {
	const post = posts.get(slug);

	if (!post) throw Error();

	return post;
}
