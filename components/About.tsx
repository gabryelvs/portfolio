const skills = {
  Languages: ["Python", "TypeScript", "C#", "SQL", "JavaScript"],
  Backend: ["FastAPI", "PostgreSQL", "Redis", "REST APIs"],
  "Front-end": ["React", "Next.js", "Tailwind CSS"],
  Tools: ["Docker", "Git", "GitHub Actions", "pytest"],
};

export function About() {
  return (
    <section id="about" className="mx-auto max-w-4xl px-6 py-24">
      <h2 className="mb-6 text-3xl font-black tracking-tight sm:text-4xl">About</h2>
      <p className="mb-10 max-w-3xl text-lg text-zinc-600 dark:text-zinc-300">
        I&apos;m a final-year Computer Science student in London focused on backend engineering.
        I build small, production-shaped services — tested, containerised, and deployed — and I
        care about correctness, resilience, and clean design.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(skills).map(([group, items]) => (
          <div key={group}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">{group}</h3>
            <ul className="flex flex-wrap gap-2">
              {items.map((s) => (
                <li key={s} className="rounded-full bg-black/5 px-2.5 py-0.5 text-sm text-zinc-700 dark:bg-white/10 dark:text-zinc-200">{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
