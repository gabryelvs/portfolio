import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { WorkEntry } from "@/components/WorkEntry";
import { SITE_NAME } from "@/lib/site";
import { caseStudies } from "@/lib/work";

export const metadata: Metadata = {
  title: `Work · ${SITE_NAME}`,
  description: "Case studies: PayLedger, Webhook Inspector and Taskboard API.",
  alternates: { canonical: "/work" },
};

export default function WorkIndex() {
  return (
    <>
      <Nav current="work" />
      <main id="main">
        <div className="wrap">
          <header className="page-head">
            <h1>Selected work</h1>
            <p>Three projects written up like design docs: the problem, the hard parts, and the tests that prove them.</p>
          </header>
          {caseStudies.map((cs) => (
            <WorkEntry key={cs.slug} cs={cs} headingLevel={2} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
