import { SectionHeading } from "@/components/SectionHeading";
import type { Project } from "@/lib/github";
import { LINKS } from "@/lib/site";
import { withoutFeatured } from "@/lib/work";

export function MoreWork({ projects }: { projects: Project[] }) {
  const rest = withoutFeatured(projects);
  return (
    <section className="block" id="more" aria-labelledby="more-title">
      <div className="wrap">
        <SectionHeading
          index="03"
          id="more-title"
          title="More work"
          sub="Everything else tagged showcase on GitHub, pulled in automatically each day."
        />
        {rest.length === 0 ? (
          <p className="empty">
            Everything tagged for this site is written up above.{" "}
            <a href={LINKS.github}>All repositories on GitHub</a>
          </p>
        ) : (
          <ul className="more-list">
            {rest.map((proj) => (
              <li key={proj.name} className="trow reveal">
                <a className="pname" href={proj.url}>
                  {proj.name}
                </a>
                <p className="pdesc">{proj.description || "No description yet."}</p>
                <span className="plang mono">{proj.language ?? "—"}</span>
                <span className="plinks">
                  <a href={proj.url} aria-label={`Repository for ${proj.name}`}>
                    Repo
                  </a>
                  {proj.homepage ? (
                    <a href={proj.homepage} aria-label={`Live demo for ${proj.name}`}>
                      Live demo
                    </a>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
