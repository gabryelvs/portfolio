import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Projects } from "@/components/Projects";
import type { Project } from "@/lib/github";

const p = (name: string): Project => ({
  name, description: "d", url: "u", homepage: null, language: null, topics: [], stars: 0,
  updatedAt: "2026-01-01T00:00:00Z",
});

describe("Projects", () => {
  it("renders a card per project", () => {
    render(<Projects projects={[p("a"), p("b")]} />);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });
  it("shows empty state when no projects", () => {
    render(<Projects projects={[]} />);
    expect(screen.getByText(/no projects/i)).toBeInTheDocument();
  });
});
