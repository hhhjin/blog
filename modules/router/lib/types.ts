export type Method = "GET" | "POST";

type IsPathParameter<Part extends string> = Part extends `:${infer Parameter}`
	? Parameter
	: Part extends `*` ? `*`
	: never;

type ExtractPath<Path extends string> = Path extends `${infer A}/${infer B}`
	? IsPathParameter<A> | ExtractPath<B>
	: IsPathParameter<Path>;

export type Params<T extends string> = Record<ExtractPath<T>, string>;

export type RouterCtx<Path extends string> = {
	params: Params<Path>;
};

export type Handler<Path extends string, Res> = (
	r: RouterCtx<Path>,
) => (...args: any) => Res | Promise<Res>;

export type Handlers<Path extends string, Res> = {
	[M in Method]?: Handler<Path, Res>;
};

export type Routes<
	Path extends string,
	Res,
> = {
	[P in Path]: Handlers<P, Res>;
};

export type Node<Path extends string, Res> = {
	type: number;
	value: string;
	handlers: Handlers<Path, Res> | null;
	children: Node<Path, Res>[];
};
