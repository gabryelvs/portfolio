import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { caseStudies } from "@/lib/work";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/work`, changeFrequency: "monthly", priority: 0.8 },
    ...caseStudies.map((cs) => ({
      url: `${SITE_URL}/work/${cs.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
