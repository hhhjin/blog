import { HtmlTemplate } from "./html.ts";

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
		head: `<title>${title}</title>`,
		body: `
      <h1>${title}</h1>
      <div>${date}</div>
      <div>${content}</div>
    `,
	});
}
