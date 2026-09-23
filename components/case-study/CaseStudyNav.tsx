import Link from "next/link";
import { adjacentCaseStudies, type Slug } from "@/lib/work";

export function CaseStudyNav({ slug }: { slug: Slug }) {
  const { prev, next } = adjacentCaseStudies(slug);
  return (
    <nav className="cs-next" aria-label="More case studies">
      {prev ? (
        <Link href={`/work/${prev.slug}`}>
          <small className="mono">← Previous case study</small>
          <strong>{prev.title}</strong>
        </Link>
      ) : (
        <Link href="/work">
          <small className="mono">← All work</small>
          <strong>Selected work</strong>
        </Link>
      )}
      {next ? (
        <Link href={`/work/${next.slug}`}>
          <small className="mono">Next case study →</small>
          <strong>{next.title}</strong>
        </Link>
      ) : (
        <Link href="/work">
          <small className="mono">All work →</small>
          <strong>Selected work</strong>
        </Link>
      )}
    </nav>
  );
}
