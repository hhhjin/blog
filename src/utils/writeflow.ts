import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

type Properties = {
  published: Extract<
    PageObjectResponse["properties"][""],
    { type: "checkbox" }
  >;
  date: Extract<PageObjectResponse["properties"][""], { type: "date" }>;
  tags: Extract<PageObjectResponse["properties"][""], { type: "multi_select" }>;
  slug: Extract<PageObjectResponse["properties"][""], { type: "rich_text" }>;
  Name: Extract<PageObjectResponse["properties"][""], { type: "title" }>;
};

type Content = {
  id: string;
  title: string;
  slug: string;
  properties: Properties;
  body: string;
  md: string;
};

type ContentFields = {
  id?: boolean;
  title?: boolean;
  slug?: boolean;
  properties?: boolean;
  body?: boolean;
  md?: boolean;
};

type PickContentFields<T extends ContentFields> = {
  [K in keyof T as T[K] extends true
    ? K extends keyof Content
      ? K
      : never
    : never]: K extends keyof Content ? Content[K] : never;
};

export const writeflow = ({
  apiKey,
  baseUrl,
}: {
  apiKey: string;
  baseUrl?: string;
}) => {
  const fetcher = (path: string, init?: Parameters<typeof fetch>[1]) =>
    fetch(baseUrl || "https://api.writeflow.dev/v0" + path, {
      ...init,
      headers: { ...init?.headers, "X-API-KEY": apiKey },
    });

  return {
    contents: {
      list: async <T extends ContentFields>(fields: T) => {
        const res = await fetcher(
          `/contents?fields=${Object.entries(fields)
            .filter(([_, v]) => v)
            .map(([field]) => field)
            .join(",")}`
        );

        if (!res.ok) {
          throw new WriteflowApiError(res.status, await res.text());
        }

        return (await res.json()) as PickContentFields<T>[];
      },
      getById: async <T extends ContentFields>(id: string, fields: T) => {
        const res = await fetcher(
          `/contents/${id}?fields=${Object.entries(fields)
            .filter(([_, v]) => v)
            .map(([field]) => field)
            .join(",")}`
        );

        if (!res.ok) {
          throw new WriteflowApiError(res.status, await res.text());
        }

        return (await res.json()) as PickContentFields<T>;
      },
      getBySlug: async <T extends ContentFields>(slug: string, fields: T) => {
        const res = await fetcher(
          `/contents/slug/${slug}?fields=${Object.entries(fields)
            .filter(([_, v]) => v)
            .map(([field]) => field)
            .join(",")}`
        );

        if (!res.ok) {
          throw new WriteflowApiError(res.status, await res.text());
        }

        return (await res.json()) as PickContentFields<T>[];
      },
    },
  };
};

export class WriteflowApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
