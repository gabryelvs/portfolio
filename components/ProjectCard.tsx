import type { Project } from "@/lib/github";

export function ProjectCard({ project }: { project: Project }) {
  const description = project.description || "No description provided.";
  const isLive = Boolean(project.homepage);
  return (
    <article className="group flex h-full flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-[box-shadow,border-color] hover:border-[var(--accent)] hover:shadow-[0_0_0_1px_var(--accent),0_12px_30px_-12px_var(--accent)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight">
          {project.name}
        </h3>
        <span
          className="tnum shrink-0 font-[family-name:var(--font-mono)] text-sm text-[var(--fg-muted)]"
          aria-label={`${project.stars} stars`}
        >
          ★ {project.stars}
        </span>
      </div>

      <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs">
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full"
          style={{ background: isLive ? "var(--ok)" : "var(--fg-muted)" }}
        />
        <span className="text-[var(--fg-muted)]">{isLive ? "live" : "repository"}</span>
      </div>

      <p className="text-sm leading-relaxed text-[var(--fg-muted)]">{description}</p>

      <div className="flex flex-wrap gap-2 font-[family-name:var(--font-mono)] text-xs">
        {project.language && (
          <span className="rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2 py-0.5 text-[var(--accent-text)]">
            {project.language}
          </span>
        )}
        {project.topics.map((t) => (
          <span
            key={t}
            className="rounded-md bg-[var(--surface-2)] px-2 py-0.5 text-[var(--fg-muted)]"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-auto flex gap-3 pt-3">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--surface-2)]"
        >
          Repo →
        </a>
        {project.homepage && (
          <a
            href={project.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--accent-contrast)] transition-colors hover:opacity-90"
          >
            Live demo →
          </a>
        )}
      </div>
    </article>
  );
}
