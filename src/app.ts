import { serve } from "std/http/server.ts";
import { router } from "./router.ts";

const port = 8000;

await serve((req) => router(req), { port });
