import type { ReactNode } from "react";
import { codeUrl } from "@/lib/work";

export type EvidenceInput = { path: string; lines?: string; children: ReactNode };

/**
 * Inserts <wbr /> at word boundaries in identifiers for better line breaking.
 * Handles underscores and camelCase transitions (lowercase/digit to uppercase).
 * Returns a ReactNode[] that preserves the original text (wbr adds no text).
 */
function breakableIdentifier(text: string): ReactNode[] {
  const result: ReactNode[] = [];
  let currentPart = "";
  let wbrKey = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const prevChar = i > 0 ? text[i - 1] : "";

    // Check if we should insert a break before this character
    const shouldBreak =
      // After underscore
      (prevChar === "_") ||
      // Before uppercase letter that follows lowercase or digit
      (char >= "A" && char <= "Z" && ((prevChar >= "a" && prevChar <= "z") || (prevChar >= "0" && prevChar <= "9")));

    if (shouldBreak && currentPart) {
      result.push(currentPart);
      result.push(<wbr key={`wbr-${wbrKey}`} />);
      wbrKey++;
      currentPart = "";
    }

    currentPart += char;
  }

  if (currentPart) {
    result.push(currentPart);
  }

  return result.length === 0 ? [text] : result;
}

export function Evidence({
  path,
  lines,
  children,
  repoUrl,
  commit,
}: EvidenceInput & { repoUrl: string; commit: string }) {
  const file = path.split("/").pop() ?? path;
  const linkContent = typeof children === "string" ? breakableIdentifier(children) : children;
  return (
    <aside className="note mono">
      <span className="k">{file}</span>
      <a href={codeUrl(repoUrl, commit, path, lines)}>{linkContent}</a>
    </aside>
  );
}
