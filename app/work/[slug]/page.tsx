import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyHeader } from "@/components/case-study/CaseStudyHeader";
import { CaseStudyNav } from "@/components/case-study/CaseStudyNav";
import { CaseStudyToc } from "@/components/case-study/CaseStudyToc";
import { Evidence, type EvidenceInput } from "@/components/case-study/Evidence";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { loadCaseStudyBody } from "@/lib/content";
import { OG_SIZE } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";
import { caseStudies, getCaseStudy } from "@/lib/work";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) return {};
  return {
    title: `${cs.title} — case study · ${SITE_NAME}`,
    description: cs.summary,
    alternates: { canonical: `/work/${cs.slug}` },
    openGraph: {
      title: `${cs.title} — case study`,
      description: cs.summary,
      type: "article",
      url: `/work/${cs.slug}`,
      // Overrides the opengraph-image.tsx file convention's generic alt with one specific to
      // this case study; see the comment in that file for why it isn't done via generateImageMetadata.
      images: [{ url: `/work/${cs.slug}/opengraph-image`, ...OG_SIZE, alt: `${cs.title}: case study` }],
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();
  const Body = await loadCaseStudyBody(cs.slug);
  const BoundEvidence = (p: EvidenceInput) => <Evidence {...p} repoUrl={cs.repoUrl} commit={cs.commit} />;

  return (
    <>
      <Nav current="work" />
      <main id="main">
        <div className="wrap">
          <CaseStudyHeader cs={cs} />
          <div className="cs-body">
            <CaseStudyToc />
            <article className="prose">
              <Body components={{ Evidence: BoundEvidence }} />
              <CaseStudyNav slug={cs.slug} />
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
