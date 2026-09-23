import { SectionHeading } from "@/components/SectionHeading";
import { WorkEntry } from "@/components/WorkEntry";
import { caseStudies } from "@/lib/work";

export function SelectedWork() {
  return (
    <section className="block" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <SectionHeading
          index="01"
          id="work-title"
          title="Selected work"
          sub="Three projects written up like design docs: the problem, the hard parts, and the tests that prove them."
        />
        {caseStudies.map((cs) => (
          <WorkEntry key={cs.slug} cs={cs} />
        ))}
      </div>
    </section>
  );
}
