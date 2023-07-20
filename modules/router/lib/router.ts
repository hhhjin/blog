import { matchMethod, matchPath, toTree } from "./tree.ts";
import { Handler, Params, Routes } from "./types.ts";

export function router<Path extends string, Res>(routes: Routes<Path, Res>) {
	const node = toTree<Path, Res>(routes);

	function forward(
		path: string,
		method: string,
	): { notFound: true; methodNotAllowed: false; handler: null } | {
		notFound: false;
		methodNotAllowed: true;
		handler: null;
	} | {
		notFound: false;
		methodNotAllowed: false;
		handler: (...args: any) => Res | Promise<Res>;
	} {
		let pathSegments = path.split("/").slice(1);
		if (
			pathSegments.length > 1 &&
			pathSegments[pathSegments.length - 1] === ""
		) {
			pathSegments = pathSegments.slice(0, -1);
		}

		const { params, handlers } = matchPath(pathSegments, node);

		if (handlers === null) {
			return {
				notFound: true,
				methodNotAllowed: false,
				handler: null,
			};
		}

		const handler = matchMethod<Path, Res>(method, handlers);

		if (handler === null) {
			return {
				notFound: false,
				methodNotAllowed: true,
				handler: null,
			};
		}

		return {
			notFound: false,
			methodNotAllowed: false,
			handler: handler({ params: params as Params<Path> }),
		};
	}

	return forward;
}
