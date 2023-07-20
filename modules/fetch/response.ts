type HtmlResponseOptions = {
	status?: number;
};

export function HtmlResponse(html: string, options?: HtmlResponseOptions) {
	return new Response(html, {
		status: options?.status,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
		},
	});
}
