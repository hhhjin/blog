import { HtmlTemplate } from "./html.ts";

const css = await Deno.readTextFile("src/templates/post.css");

export interface PostTemplateParams {
	title: string;
	date: string;
	content: string;
}

export function PostTemplate({
	title,
	date,
	content,
}: PostTemplateParams) {
	return HtmlTemplate({
		head: `
			<title>${title}</title>
			<style>${css}</style>
		`,
		body: `
			<article>
				<header>
					<h1>${title}</h1>
					<div>${date}</div>
				</header>
				<div>${content}</div>
			</article>
    `,
	});
}
