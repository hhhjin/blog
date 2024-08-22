import { renderBlocks } from "@writeflow/react";
import type { ExtendedBlock } from "@writeflow/types";
import { useMemo } from "react";
import { Image } from "./Image";
import Prism from "prismjs";
import "prismjs/themes/prism.min.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.min.css";

export function Renderer({ body }: { body: ExtendedBlock[] }) {
  const blocks = useMemo(
    () =>
      renderBlocks(body, {
        code: ({ block }) => (
          <pre
            data-filename={
              block.code.caption.length
                ? block.code.caption.map((c) => c.plain_text).join("")
                : undefined
            }
            className={block.code.caption.length ? "" : "pt-4"}
          >
            <code
              dangerouslySetInnerHTML={{
                __html: Prism.highlight(
                  block.code.rich_text.map((r) => r.plain_text).join(""),
                  block.code.language === "bash"
                    ? Prism.languages.bash
                    : block.code.language === "typescript"
                    ? Prism.languages.tsx
                    : Prism.languages.tsx,
                  block.code.language === "typescript"
                    ? "tsx"
                    : block.code.language
                ),
              }}
            />
          </pre>
        ),
        image: ({ block }) => (
          <p className="flex justify-center">
            <Image
              className="rounded"
              src={block.image.file.url}
              alt={block.image.caption.map((c) => c.plain_text).join("")}
              width={block.image.file.width}
              height={block.image.file.height}
              blurDataUrl={block.image.file.blurDataUrl}
            />
          </p>
        ),
      }),
    []
  );
  return <>{blocks}</>;
}
