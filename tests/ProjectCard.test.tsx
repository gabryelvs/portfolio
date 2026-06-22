import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/lib/github";

const base: Project = {
  name: "payledger",
  description: "A payments API",
  url: "https://github.com/gabryelvs/payledger",
  homepage: "https://payledger-gv.fly.dev/docs",
  language: "Python",
  topics: ["fastapi", "fintech"],
  stars: 5,
  updatedAt: "2026-06-18T00:00:00Z",
};

describe("ProjectCard", () => {
  it("renders name, description, language, tags, stars", () => {
    render(<ProjectCard project={base} />);
    expect(screen.getByText("payledger")).toBeInTheDocument();
    expect(screen.getByText("A payments API")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("fastapi")).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });
  it("links Repo to the repo url", () => {
    render(<ProjectCard project={base} />);
    expect(screen.getByRole("link", { name: /repo/i })).toHaveAttribute("href", base.url);
  });
  it("shows Live demo only when homepage present", () => {
    const { rerender } = render(<ProjectCard project={base} />);
    expect(screen.getByRole("link", { name: /live demo/i })).toHaveAttribute("href", base.homepage!);
    rerender(<ProjectCard project={{ ...base, homepage: null }} />);
    expect(screen.queryByRole("link", { name: /live demo/i })).toBeNull();
  });
});
