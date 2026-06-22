import fallback from "@/data/projects.fallback.json";

export type Project = {
  name: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  updatedAt: string;
};

export const fallbackProjects: Project[] = fallback as Project[];

type GitHubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  updated_at: string;
  fork: boolean;
  archived: boolean;
};

export function mapRepo(raw: GitHubRepo): Project {
  return {
    name: raw.name,
    description: raw.description ?? "",
    url: raw.html_url,
    homepage: raw.homepage ? raw.homepage : null,
    language: raw.language,
    topics: (raw.topics ?? []).filter((t) => t !== "showcase"),
    stars: raw.stargazers_count,
    updatedAt: raw.updated_at,
  };
}

export function selectShowcase(repos: GitHubRepo[]): Project[] {
  return repos
    .filter((r) => !r.fork && !r.archived && (r.topics ?? []).includes("showcase"))
    .map(mapRepo)
    .sort((a, b) => b.stars - a.stars || b.updatedAt.localeCompare(a.updatedAt));
}

export async function getShowcaseProjects(fetchImpl: typeof fetch = fetch): Promise<Project[]> {
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetchImpl(
      "https://api.github.com/users/gabryelvs/repos?per_page=100&sort=updated",
      { headers },
    );
    if (!res.ok) return fallbackProjects;
    const repos = (await res.json()) as GitHubRepo[];
    const projects = selectShowcase(repos);
    return projects.length > 0 ? projects : fallbackProjects;
  } catch {
    return fallbackProjects;
  }
}
