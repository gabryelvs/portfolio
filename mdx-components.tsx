import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { Claim } from "@/components/case-study/Claim";
import { H2 } from "@/components/case-study/Heading";

/** Focusable so keyboard users can scroll a wide code block that has no other focusable content. */
function Pre(props: ComponentPropsWithoutRef<"pre">) {
  return <pre {...props} tabIndex={0} />;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { h2: H2, pre: Pre, Claim, ...components };
}
