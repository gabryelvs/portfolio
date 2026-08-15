"use client";

import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import type { Project } from "@/lib/github";

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading index="01" title="Projects" />
      {projects.length === 0 ? (
        <p className="text-[var(--fg-muted)]">No projects to show yet — check back soon.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            // stagger capped at 6 cards so a long list never delays the last card
            <Reveal key={project.name} delay={Math.min(i, 5) * 0.06}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
