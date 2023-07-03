import { HtmlTemplate } from "../templates/html.ts";

const html = HtmlTemplate({
	head: `<title>404</title>`,
	body: `<div>존재하지 않는 페이지입니다</div>`,
});

export function NotFoundPage() {
	return html;
}
