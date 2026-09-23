import type { ReactNode } from "react";
import { codeUrl } from "@/lib/work";

export type EvidenceInput = { path: string; lines?: string; children: ReactNode };

/**
 * Inserts <wbr /> after every underscore in a string for better line breaking.
 * Returns a ReactNode[] that preserves the original text (wbr adds no text).
 */
function breakableAtUnderscores(text: string): ReactNode[] {
  const parts = text.split("_");
  if (parts.length === 1) return [text];

  const result: ReactNode[] = [];
  parts.forEach((part, i) => {
    result.push(part);
    if (i < parts.length - 1) {
      result.push("_");
      result.push(<wbr key={`wbr-${i}`} />);
    }
  });
  return result;
}

export function Evidence({
  path,
  lines,
  children,
  repoUrl,
  commit,
}: EvidenceInput & { repoUrl: string; commit: string }) {
  const file = path.split("/").pop() ?? path;
  const linkContent = typeof children === "string" ? breakableAtUnderscores(children) : children;
  return (
    <aside className="note mono">
      <span className="k">{file}</span>
      <a href={codeUrl(repoUrl, commit, path, lines)}>{linkContent}</a>
    </aside>
  );
}
