import { serve } from "std/http/server.ts";

const port = 8000;

const handler = (_req: Request) => {
	return new Response("blog", { status: 200 });
};

await serve(handler, { port });
console.log("Access it at: http://localhost:8000");
