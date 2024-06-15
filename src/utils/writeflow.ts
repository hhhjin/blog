type ContentFields = {
  id?: boolean;
  title?: boolean;
  slug?: boolean;
  properties?: boolean;
  body?: boolean;
  mdBody?: boolean;
};

type Content = {
  id: string;
  title: string;
  slug: string;
  properties: Record<string, any>;
  body: string;
  mdBody: string;
};

type PickContentFields<T extends ContentFields> = {
  [K in keyof T as T[K] extends true
    ? K extends keyof Content
      ? K
      : never
    : never]: K extends keyof Content ? Content[K] : never;
};

export const writeflow = {
  v0: {
    contents: {
      list: async <T extends ContentFields>(fields: T) => {
        const res = await fetch(
          `https://api.writeflow.dev/v0/contents?fields=${Object.entries(fields)
            .filter(([_, v]) => v)
            .map(([field]) => field)
            .join(",")}`,
          {
            headers: {
              "X-API-KEY": import.meta.env.WRITEFLOW_API_KEY,
            },
          }
        );

        if (!res.ok) {
          throw new Error(res.status.toString());
        }

        return (await res.json()) as PickContentFields<T>[];
      },
    },
  },
};
