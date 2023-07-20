import { assertObjectMatch } from "std/testing/asserts.ts";
import { matchPath, toTree } from "./tree.ts";
import { Node } from "./types.ts";

// Deno.test("toTree", () => {
// 	const handler1 = () => () => {};
// 	const handler2 = () => () => {};
// 	const handler3 = () => () => {};
// 	const handler4 = () => () => {};
// 	const handler5 = () => () => {};

// 	const node = toTree({
// 		"/": {
// 			GET: handler1,
// 		},
// 		"/first": {
// 			GET: handler2,
// 		},
// 		"/first/:a": {
// 			GET: handler3,
// 		},
// 		"/first/:a/third": {
// 			GET: handler4,
// 		},
// 		"/first/:a/third/:b": {
// 			GET: handler5,
// 		},
// 	});

// 	const expectedNode: Node = {
// 		type: 0,
// 		value: "",
// 		handlers: null,
// 		children: [
// 			{
// 				type: 0,
// 				value: "",
// 				handlers: { GET: handler1 },
// 				children: [],
// 			},
// 			{
// 				type: 0,
// 				value: "first",
// 				handlers: { GET: handler2 },
// 				children: [
// 					{
// 						type: 1,
// 						value: "a",
// 						handlers: { GET: handler3 },
// 						children: [
// 							{
// 								type: 0,
// 								value: "third",
// 								handlers: { GET: handler4 },
// 								children: [
// 									{
// 										type: 1,
// 										value: "b",
// 										handlers: { GET: handler5 },
// 										children: [],
// 									},
// 								],
// 							},
// 						],
// 					},
// 				],
// 			},
// 		],
// 	};

// 	assertObjectMatch(node, expectedNode);
// });

Deno.test("matchPath", () => {
	// const pathSegments = ["post", "slug-1", "image", "slug-2"];
	// const node = toTree({
	// 	"/": {
	// 		GET: () => () => "/",
	// 	},
	// 	"/post/:slug": {
	// 		GET: () => () => "/post/:slug",
	// 	},
	// 	"/post/:slug1/image/:slug2": {
	// 		GET: () => () => "hi",
	// 	},
	// });

	// const result = matchPath(pathSegments, node);

	const node2 = toTree({
		"/hi/hello": {
			GET: () => () => "/hi/hello",
		},
		"/hi/:param": {
			GET: ({ params }) => () => params.param,
		},
		"/hi/:param/hello": {
			GET: ({ params }) => () => `/hi/${params.param}/hello`,
		},
		"/hi": {
			GET: () => () => "/hi",
		},
		"/": {
			GET: () => () => "/",
		},
		"/:param": {
			GET: ({ params }) => () => params.param,
		},
	});

	console.log(matchPath(["hi"], node2));
});
