import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/github", () => ({
  getShowcaseProjects: vi.fn(async () => [
    { name: "fx-service", description: "FX.", url: "https://github.com/gabryelvs/fx-service", homepage: null, language: "Python", topics: [], stars: 0, updatedAt: "2026-01-01T00:00:00Z" },
  ]),
}));

import Home from "@/app/page";

describe("Home", () => {
  it("renders the sections in the agreed order", async () => {
    render(await Home());
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s).toEqual(["Selected work", "Experience", "More work", "About", "Contact"]);
  });

  it("has one h1, a main landmark for the skip link, and a footer", async () => {
    render(await Home());
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
