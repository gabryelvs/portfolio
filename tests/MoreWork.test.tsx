import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MoreWork } from "@/components/MoreWork";
import type { Project } from "@/lib/github";

const p = (over: Partial<Project>): Project => ({
  name: "fx-service", description: "Async currency API.", url: "https://github.com/gabryelvs/fx-service",
  homepage: "https://fx-service-gv.fly.dev/docs", language: "Python", topics: [], stars: 0,
  updatedAt: "2026-01-01T00:00:00Z", ...over,
});

describe("MoreWork", () => {
  it("renders the list with the more-list class, not the Tailwind-colliding table class", () => {
    render(<MoreWork projects={[p({}), p({ name: "payledger" })]} />);
    const list = screen.getByRole("list");
    expect(list).toHaveClass("more-list");
    expect(list).not.toHaveClass("table");
  });

  it("lists non-featured showcase repos with repo and demo links", () => {
    render(<MoreWork projects={[p({}), p({ name: "payledger" })]} />);
    expect(screen.getByRole("heading", { level: 2, name: "More work" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "fx-service" })).toHaveAttribute("href", "https://github.com/gabryelvs/fx-service");
    expect(screen.getByRole("link", { name: "Live demo for fx-service" })).toHaveAttribute("href", "https://fx-service-gv.fly.dev/docs");
    expect(screen.queryByRole("link", { name: "payledger" })).toBeNull();
  });

  it("omits the demo link when a repo has no homepage", () => {
    render(<MoreWork projects={[p({ name: "webhook-dispatcher", homepage: null })]} />);
    expect(screen.queryByRole("link", { name: /Live demo/ })).toBeNull();
  });

  it("stays honest when a repo has no description or language", () => {
    render(<MoreWork projects={[p({ description: "", language: null })]} />);
    expect(screen.getByText("No description yet.")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("explains an empty list instead of rendering nothing", () => {
    render(<MoreWork projects={[p({ name: "payledger" })]} />);
    expect(screen.getByText(/Everything tagged for this site is written up above/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All repositories on GitHub" })).toHaveAttribute("href", "https://github.com/gabryelvs");
  });
});
