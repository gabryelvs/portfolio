import { SectionHeading } from "@/components/SectionHeading";

const skills = {
  Languages: ["Python", "Java", "TypeScript", "C#", "SQL", "JavaScript"],
  Backend: ["FastAPI", "Spring Boot", "PostgreSQL", "Redis", "REST APIs"],
  "Front-end": ["React", "Next.js", "Tailwind CSS"],
  Tools: ["Docker", "Git", "GitHub Actions", "pytest", "Testcontainers"],
};

export function About() {
  return (
    <section id="about" className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading index="02" title="About" />
      <p className="mb-12 max-w-3xl text-lg leading-relaxed text-[var(--fg-muted)]">
        I&apos;m a final-year Computer Science student in London focused on backend engineering.
        I build small, production-shaped services — tested, containerised, and deployed — and I
        care about correctness, resilience, and clean design.
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(skills).map(([group, items]) => (
          <div key={group}>
            <h3 className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--accent-text)]">
              {group}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {items.map((s) => (
                <li
                  key={s}
                  className="rounded-md bg-[var(--surface)] px-2.5 py-1 text-sm text-[var(--fg)]"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
