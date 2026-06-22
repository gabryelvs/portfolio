import type { Project } from "@/lib/github";

export function ProjectCard({ project }: { project: Project }) {
  const description = project.description || "No description provided.";
  return (
    <article className="group flex flex-col gap-3 rounded-2xl border border-black/10 bg-black/[0.04] p-6 transition hover:-translate-y-1 hover:border-violet-400/60 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xl font-bold tracking-tight">{project.name}</h3>
        <span className="text-sm text-amber-600 dark:text-amber-300" aria-label={`${project.stars} stars`}>
          ★ {project.stars}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
      <div className="flex flex-wrap gap-2">
        {project.language && (
          <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs text-violet-700 dark:text-violet-200">
            {project.language}
          </span>
        )}
        {project.topics.map((t) => (
          <span key={t} className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-auto flex gap-3 pt-2">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-black/5 px-3 py-1.5 text-sm font-medium hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
        >
          Repo →
        </a>
        {project.homepage && (
          <a
            href={project.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-400"
          >
            Live demo →
          </a>
        )}
      </div>
    </article>
  );
}
