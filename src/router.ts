import { HomePage } from "./pages/home.ts";
import { NotFoundPage } from "./pages/not-found.ts";
import { PostPage } from "./pages/post.ts";

export async function router(req: Request) {
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

		if (paths.length === 1 && paths[0] === "robots.txt") {
			const robotsTxt = await Deno.readFile(
				`${Deno.cwd()}/static/robots.txt`,
			);
			return new Response(robotsTxt, {
				status: 200,
				headers: { "Content-Type": "text/plain" },
			});
		}
	} catch (e) {
		console.log(e);
		// if (e instanceof Error) {}
	}

	// NotFound
	return new Response(NotFoundPage(), {
		status: 200,
		headers: { "Content-Type": "text/html; charset=utf-8" },
	});
}
