import { OG_SIZE, ogImage } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";
import { caseStudies, getCaseStudy } from "@/lib/work";

// Generic fallback alt for this file-convention image; the page's own `generateMetadata`
// (app/work/[slug]/page.tsx) sets a per-case-study `openGraph.images[].alt` that overrides
// this for the actual case-study pages (see the comment there for why: `generateImageMetadata`
// is the documented way to vary this per param, but on this Next 16.2.9 + Turbopack build it
// produces a route that 404s at runtime even though the build itself succeeds — confirmed by
// building, running `next start`, and requesting the generated image URL).
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
