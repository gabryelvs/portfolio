import type { MDXComponents } from "mdx/types";
import { Claim } from "@/components/case-study/Claim";
import { H2 } from "@/components/case-study/Heading";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { h2: H2, Claim, ...components };
}
