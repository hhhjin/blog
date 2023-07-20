import { describe, it } from "std/testing/bdd.ts";
import { assertEquals } from "std/testing/asserts.ts";
import { router } from "./router.ts";

describe("Basic Usage", () => {
	const forward = router({
		"/hello": {
			GET: () => () => "get /hello",
			POST: () => () => "post /hello",
		},
	});

	it("get, post hello", () => {
		let res = forward("/hello", "GET");
		assertEquals(res.notFound, false);
		assertEquals(res.methodNotAllowed, false);
		assertEquals(res.handler!(), "get /hello");

		res = forward("/hello", "POST");
		assertEquals(res.notFound, false);
		assertEquals(res.methodNotAllowed, false);
		assertEquals(res.handler!(), "post /hello");

		res = forward("/hello", "PUT");
		assertEquals(res.notFound, false);
		assertEquals(res.methodNotAllowed, true);
		assertEquals(res.handler, null);

		res = forward("/hi", "GET");
		assertEquals(res.notFound, true);
		assertEquals(res.methodNotAllowed, false);
		assertEquals(res.handler, null);
	});
});

describe("Complex", () => {
	it("Named Param", () => {
		let forward = router({
			"/entry/:id": {
				GET: ({ params }) => () => `get entry/${params.id}`,
			},
		});
		let res = forward("/entry/123", "GET");
		assertEquals(res.notFound, false);
		assertEquals(res.methodNotAllowed, false);
		assertEquals(res.handler!(), "get entry/123");
	});
});

describe("Trailing slash", () => {
	const forward = router({
		"/book": { GET: () => () => "get /book" },
		"/book/:id": { GET: ({ params }) => () => `get /book/${params.id}` },
	});

	it("GET /book", () => {
		const res = forward("/book", "GET");
		assertEquals(res.notFound, false);
		assertEquals(res.methodNotAllowed, false);
		assertEquals(res.handler!(), "get /book");
	});

	it("GET /book/", () => {
		const res = forward("/book/", "GET");
		assertEquals(res.notFound, false);
		assertEquals(res.methodNotAllowed, false);
		assertEquals(res.handler!(), "get /book");
	});
});

describe("Priority", () => {
	const forward = router({
		"/:ho": { GET: () => () => `get /:ho` },
		"/hey": { GET: () => () => "get /hey" },
	});

	it("GET /hey", () => {
		const res = forward("/hey", "GET");
		assertEquals(res.notFound, false);
		assertEquals(res.methodNotAllowed, false);
		assertEquals(res.handler!(), "get /:ho");
	});
});

describe("Multi params", () => {
	function test(forward: any) {
		let res = forward("/users", "GET");
		assertEquals(res.notFound, false);
		assertEquals(res.methodNotAllowed, false);
		assertEquals(res.handler(), "get /users");

		res = forward("/users/1", "GET");
		assertEquals(res.notFound, false);
		assertEquals(res.methodNotAllowed, false);
		assertEquals(res.handler(), "get /users/:userId");

		res = forward("/users/1/posts", "GET");
		assertEquals(res.notFound, false);
		assertEquals(res.methodNotAllowed, false);
		assertEquals(res.handler(), "get /users/:userId/posts");

		res = forward("/users/1/posts/2", "GET");
		assertEquals(res.notFound, false);
		assertEquals(res.methodNotAllowed, false);
		assertEquals(res.handler(), "get /users/:userId/posts/:postId");
	}

	it("Ascending", () => {
		const forward = router({
			"/users": {
				GET: () => () => "get /users",
			},
			"/users/:userId": {
				GET: () => () => "get /users/:userId",
			},
			"/users/:userId/posts": {
				GET: () => () => "get /users/:userId/posts",
			},
			"/users/:userId/posts/:postId": {
				GET: () => () => "get /users/:userId/posts/:postId",
			},
		});

		test(forward);
	});

	it("Descending", () => {
		const forward = router({
			"/users/:userId/posts/:postId": {
				GET: () => () => "get /users/:userId/posts/:postId",
			},
			"/users/:userId/posts": {
				GET: () => () => "get /users/:userId/posts",
			},
			"/users/:userId": {
				GET: () => () => "get /users/:userId",
			},
			"/users": {
				GET: () => () => "get /users",
			},
		});

		test(forward);
	});
});

describe("Params", () => {
	const forward = router({
		"/post/:slug": {
			GET: ({ params }) => () => `/post/${params.slug}`,
		},
		"/post/:postSlug/image/:imageSlug": {
			GET: ({ params }) => () =>
				`/post/${params.postSlug}/image/${params.imageSlug}`,
		},
	});

	const res = forward("/post/post1/image/image1", "GET");
	assertEquals(res.notFound, false);
	assertEquals(res.methodNotAllowed, false);
	assertEquals(res.handler!(), "/post/post1/image/image1");
});
