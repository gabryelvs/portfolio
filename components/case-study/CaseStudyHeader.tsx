import Link from "next/link";
import { SequenceDiagram } from "@/components/diagrams/SequenceDiagram";
import { LiveStatus } from "@/components/LiveStatus";
import { sequences } from "@/lib/sequences";
import { BUILT_WITH } from "@/lib/site";
import type { CaseStudy } from "@/lib/work";

export function CaseStudyHeader({ cs }: { cs: CaseStudy }) {
  return (
    <header className="cs-head">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/work">Work</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{cs.title}</span>
      </nav>
      <h1>{cs.title}</h1>
      <p className="summary">{cs.summary}</p>
      <dl className="meta">
        <div>
          <dt className="mono">Role</dt>
          <dd>{cs.role}</dd>
        </div>
        <div>
          <dt className="mono">Stack</dt>
          <dd>{cs.stack.join(" · ")}</dd>
        </div>
        <div>
          <dt className="mono">Status</dt>
          <dd>
            {cs.liveUrl ? (
              <>
                <LiveStatus label="Live" /> · <a href={cs.liveUrl}>{cs.liveLabel}</a> ·{" "}
              </>
            ) : (
              <>Repository only · </>
            )}
            <a href={cs.repoUrl}>Repo</a>
          </dd>
        </div>
        <div>
          <dt className="mono">Tests</dt>
          <dd>{cs.tests}</dd>
        </div>
        <div className="how">
          <dt className="mono">How it was built</dt>
          <dd>{BUILT_WITH}</dd>
        </div>
      </dl>
      <SequenceDiagram seq={sequences[cs.slug]} />
    </header>
  );
}
