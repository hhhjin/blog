import { renderBlocks } from "@writeflow/react";
import type { ExtendedBlock } from "@writeflow/types";
import { useMemo } from "react";

export function Renderer({ body }: { body: ExtendedBlock[] }) {
  const blocks = useMemo(() => renderBlocks(body), []);
  return <>{blocks}</>;
}
