import { router } from "@hyeongjin/router/mod.ts";

import { HomePage } from "./pages/home.ts";
import { PostPage } from "./pages/post.ts";
import { HtmlResponse } from "../modules/fetch/response.ts";

export const forward = router({
	"/": {
		GET: () => () => {
			return HtmlResponse(HomePage());
		},
	},
	"/robots.txt": {
		GET: () => async () => {
			const robotsTxt = await Deno.readFile(
				`static/robots.txt`,
			);

			return new Response(robotsTxt, {
				status: 200,
				headers: { "Content-Type": "text/plain" },
			});
		},
	},
	"/post/:slug": {
		GET: ({ params }) => () => {
			return new Response(PostPage({ slug: params.slug }), {
				status: 200,
				headers: { "Content-Type": "text/html; charset=utf-8" },
			});
		},
	},
	"/posts/:postSlug/image/:imageName": {
		GET: ({ params }) => async () => {
			const postSlug = decodeURI(params.postSlug);
			const imageName = decodeURI(params.imageName);

			const headers = new Headers();
			// @todo
			headers.append("Content-Type", "image/png");

			const image = await Deno.readFile(
				`posts/${postSlug}/image/${imageName}`,
			);
			return new Response(image, { headers });
		},
	},
});
