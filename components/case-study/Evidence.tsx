import type { ReactNode } from "react";
import { codeUrl } from "@/lib/work";

export type EvidenceInput = { path: string; lines?: string; children: ReactNode };

export function Evidence({
  path,
  lines,
  children,
  repoUrl,
  commit,
}: EvidenceInput & { repoUrl: string; commit: string }) {
  const file = path.split("/").pop() ?? path;
  return (
    <aside className="note mono">
      <span className="k">{file}</span>
      <a href={codeUrl(repoUrl, commit, path, lines)}>{children}</a>
    </aside>
  );
}
