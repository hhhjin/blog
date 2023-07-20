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
	"/post/:postSlug/image/:imageSlug": {
		GET: ({ params }) => () => {
			console.log(params);
			// todo
			return new Response(
				`/post/${params.postSlug}/image/${params.imageSlug}`,
			);
		},
	},
});
