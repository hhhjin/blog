export interface HtmlTemplateParams {
	head?: string;
	body?: string;
}

export function HtmlTemplate({ head, body }: HtmlTemplateParams) {
	return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="description" content="이형진의 블로그">
      <meta name="author" content="이형진">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${head}
    </head>
    <body>${body}</body>
    </html>
  `;
}
