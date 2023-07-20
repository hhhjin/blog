import { Handlers, Node, Routes } from "./types.ts";

export function toTree<Path extends string, Res>(routes: Routes<Path, Res>) {
	const node: Node<Path, Res> = {
		type: 0,
		value: "",
		handlers: null,
		children: [],
	};

	for (const [path, handlers] of Object.entries(routes).reverse()) {
		const segments = path.split("/").slice(1);
		let curNode = node;
		let childNode: Node<Path, Res> | null = null;

		for (const segment of segments) {
			let type = 0, value = segment;
			childNode = null;

			if (segment[0] === ":") {
				type = 1;
				value = value.slice(1);
			}

			for (const child of curNode.children) {
				if (child.type === type && child.value === value) {
					childNode = child;
					break;
				}
			}

			if (childNode === null) {
				childNode = { type, value, handlers: null, children: [] };
				curNode.children.push(childNode);
			}

			curNode = childNode;
		}

		curNode.handlers = handlers as Handlers<Path, Res>;
	}

	return node;
}

export function matchPath<Path extends string, Res>(
	pathSegments: string[],
	node: Node<Path, Res>,
) {
	const stack = [node];
	const p: ({ key: string; value: string } | undefined)[] = Array(
		pathSegments.length,
	).fill(undefined);
	let level = -1;
	let curNode;
	let hasChild = false;
	let handlers: Node<Path, Res>["handlers"] | null = null;

	while ((curNode = stack.pop())) {
		if (curNode.type === 1) {
			p[level] = { key: curNode.value, value: pathSegments[level] };
		}

		hasChild = false;
		level++;
		const pathSegment = pathSegments[level];

		if (level > pathSegments.length) {
			level--;
			continue;
		}

		if (level === pathSegments.length) {
			handlers = curNode.handlers;
			break;
		}

		for (const child of curNode.children) {
			if (child.type === 1) {
				stack.push(child);
				hasChild = true;
				continue;
			}

			if (child.type === 0 && child.value === pathSegment) {
				stack.push(child);
				hasChild = true;
				continue;
			}
		}

		if (!hasChild) level--;
	}

	const params: Record<string, string> = {};

	if (handlers) {
		for (const param of p) {
			if (param) {
				params[param.key] = param.value;
			}
		}
	}

	return { params, handlers };
}

export function matchMethod<Path extends string, Res>(
	method: string,
	handlers: Handlers<Path, Res>,
) {
	for (const [m, h] of Object.entries(handlers)) {
		if (m === method) {
			return h;
		}
	}

	return null;
}
