import { PostTemplate } from "../templates/post.ts";

const postsInfo = JSON.parse(
	await Deno.readTextFile("generated/posts.json"),
) as {
	title: string;
	slug: string;
	date: string;
	hashed: string;
}[];

const posts = new Map<string, string>();

for (const post of postsInfo) {
	const { title, slug, date } = post;

	const content = await Deno.readTextFile(`generated/posts/${slug}.html`);

	posts.set(
		slug,
		PostTemplate({
			title,
			date,
			content,
		}),
	);
}

export function PostPage({ slug }: { slug: string }) {
	const post = posts.get(slug);

	if (!post) throw Error();

	return post;
}
