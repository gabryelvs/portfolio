import { SectionHeading } from "@/components/SectionHeading";

const skills: [string, string][] = [
  ["Languages", "Python, Java, TypeScript, SQL, C#, JavaScript"],
  ["Backend", "FastAPI, Spring Boot, PostgreSQL, Redis, REST APIs"],
  ["Front-end", "React, Next.js, Vite, Tailwind CSS"],
  ["Tools", "Docker, Git, GitHub Actions, pytest, Vitest, Testcontainers"],
];

export function About() {
  return (
    <section className="block" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHeading index="04" id="about-title" title="About" />
        <div className="about-grid">
          <div>
            <p>
              I&apos;m a software engineer in London. I build small, production-shaped services,
              tested, containerised and deployed, and I care most about the parts that fail quietly:
              concurrency, retries, and what happens when a dependency is down.
            </p>
            <p>
              I work with AI-assisted development and treat it like any other tool: I set the design,
              review every change, and don&apos;t ship what I can&apos;t explain or test.
            </p>
          </div>
          <dl className="skills">
            {skills.map(([k, v]) => (
              <div key={k} className="skill">
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
