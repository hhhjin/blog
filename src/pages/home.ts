import { HtmlTemplate } from "../templates/html.ts";

const posts = JSON.parse(await Deno.readTextFile("generated/posts.json")) as {
	title: string;
	slug: string;
	date: string;
	hashed: string;
}[];

const list = posts.sort((
	a,
	b,
) => (new Date(b.date).getTime() - new Date(a.date).getTime())).map(
	(
		post,
	) => `<li><a href="/post/${post.slug}">${post.title}</a></li>`,
).join("");

const html = HtmlTemplate({
	head: "<title>블로그</title>",
	body: `
    <h1>블로그</h1>
    <div>
      <ul>
        ${list}
      </ul>
    </div>
  `,
});

export function HomePage() {
	return html;
}
