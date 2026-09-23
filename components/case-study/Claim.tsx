import type { ReactNode } from "react";

/** A block of prose with at most one <Evidence> note, which sits in the margin on wide screens. */
export function Claim({ children }: { children?: ReactNode }) {
  return <div className="pair">{children}</div>;
}
