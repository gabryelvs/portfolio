import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Nav } from "@/components/Nav";

describe("Nav", () => {
  it("links the name home and offers a skip link", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "Gabryel Verissimo" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
  });

  it("links every home section", () => {
    render(<Nav />);
    for (const [name, href] of [
      ["Work", "/#work"],
      ["Experience", "/#experience"],
      ["About", "/#about"],
      ["Contact", "/#contact"],
    ]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  it("marks Work as current on case-study pages only", () => {
    const { rerender } = render(<Nav />);
    expect(screen.getByRole("link", { name: "Work" })).not.toHaveAttribute("aria-current");
    rerender(<Nav current="work" />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "true");
  });

  it("keeps the theme toggle", async () => {
    render(<Nav />);
    expect(await screen.findByRole("button", { name: /theme/i })).toBeInTheDocument();
  });
});
