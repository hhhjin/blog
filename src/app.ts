import { serve } from "std/http/server.ts";
import { HtmlResponse } from "@hyeongjin/fetch/response.ts";
import { forward } from "./routes.ts";
import { NotFoundPage } from "./pages/not-found.ts";

const port = 8000;

await serve(
	(req) => {
		try {
			const res = forward(new URL(req.url).pathname, req.method);

			if (res.notFound || res.methodNotAllowed) {
				return HtmlResponse(NotFoundPage(), { status: 404 });
			}

			return res.handler();
		} catch (e) {
			console.log(e);
			return new Response("Internal Server Error", { status: 500 });
		}
	},
	{ port },
);
