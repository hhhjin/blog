import { HomePage } from "./pages/home.ts";
import { NotFoundPage } from "./pages/not-found.ts";
import { PostPage } from "./pages/post.ts";

export function router(req: Request): Response {
	const pathname = new URL(req.url).pathname;
	const paths = pathname.split("/").slice(1);

	try {
		// "/"
		if (paths[0] === "") {
			return new Response(HomePage(), {
				status: 200,
				headers: { "Content-Type": "text/html; charset=utf-8" },
			});
		}

		// "/posts/post-slug"
		if (paths.length === 2 && paths[0] === "posts") {
			return new Response(PostPage({ slug: paths[1] }), {
				status: 200,
				headers: { "Content-Type": "text/html; charset=utf-8" },
			});
		}

		// "/posts/post-slug/image/image-name.jpg"
		if (
			paths.length === 4 && paths[0] === "posts" && paths[2] === "image"
		) {
			// @todo
		}
	} catch (_e) {
		// if (e instanceof Error) {}
	}

	// NotFound
	return new Response(NotFoundPage(), {
		status: 200,
		headers: { "Content-Type": "text/html; charset=utf-8" },
	});
}
