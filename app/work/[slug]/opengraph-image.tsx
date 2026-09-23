import { OG_SIZE, ogImage } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";
import { caseStudies, getCaseStudy } from "@/lib/work";

export const alt = "Case study";
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudy(slug)!;
  return ogImage({ kicker: `Case study · ${SITE_NAME}`, title: cs.title, subtitle: cs.summary });
}
