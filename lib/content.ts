import type { MDXProps } from "mdx/types";
import type { ComponentType } from "react";
import type { Slug } from "@/lib/work";

type Loaded = { default: ComponentType<MDXProps> };

const loaders: Record<Slug, () => Promise<Loaded>> = {
  payledger: () => import("@/content/work/payledger.mdx"),
  "webhook-inspector": () => import("@/content/work/webhook-inspector.mdx"),
  "taskboard-api": () => import("@/content/work/taskboard-api.mdx"),
};

export async function loadCaseStudyBody(slug: Slug): Promise<ComponentType<MDXProps>> {
  return (await loaders[slug]()).default;
}
