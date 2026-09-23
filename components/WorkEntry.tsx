import Link from "next/link";
import { Fragment } from "react";
import { WorkThumb } from "@/components/diagrams/WorkThumb";
import { LiveStatus } from "@/components/LiveStatus";
import type { CaseStudy } from "@/lib/work";

export function WorkEntry({ cs, headingLevel = 3 }: { cs: CaseStudy; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const href = `/work/${cs.slug}`;
  return (
    <article className="work reveal">
      <div>
        <Heading className="work-title">
          <Link href={href}>{cs.title}</Link>
          {cs.liveUrl ? <LiveStatus label="Live demo" /> : null}
        </Heading>
        <p className="problem">{cs.summary}</p>
        <dl className="facts mono">
          {cs.facts.map((f) => (
            <Fragment key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </Fragment>
          ))}
          <dt>Stack</dt>
          <dd>{cs.stack.slice(0, 4).join(" · ")}</dd>
        </dl>
        <Link className="more-link" href={href}>
          Read the case study <span className="sr-only">about {cs.title}</span>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
      <figure>
        <WorkThumb slug={cs.slug} />
        <figcaption className="mono">{cs.thumbCaption}</figcaption>
      </figure>
    </article>
  );
}
