import { HtmlTemplate } from "../templates/html.ts";

const cwd = Deno.cwd();
const postList: { title: string; slug: string; date: string }[] = [];

for await (const dirEntry of Deno.readDir(`${cwd}/posts`)) {
	if (dirEntry.name.startsWith(".")) continue;

	const meta = await Deno.readTextFile(
		`${cwd}/posts/${dirEntry.name}/metadata.json`,
	);

	postList.push(JSON.parse(meta));
}

const list = postList.map((post) =>
	`<li><a href="/post/${post.slug}">${post.title}</a></li>`
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
