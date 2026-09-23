import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/Hero";

describe("Hero", () => {
  it("uses the name as the only h1, with the role inside it", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Gabryel Verissimo");
    expect(h1).toHaveTextContent("Software Engineer");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("states the focus and availability", () => {
    const { container } = render(<Hero />);
    expect(container).toHaveTextContent(/reliable systems for fintech/i);
    expect(container).toHaveTextContent(/Open to graduate & junior roles · London · from summer 2027/);
  });

  it("offers Selected work and Download CV", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Selected work" })).toHaveAttribute("href", "#work");
    expect(screen.getByRole("link", { name: /Download CV/ })).toHaveAttribute("href", "/cv.pdf");
  });

  it("shows no vanity counters", () => {
    const { container } = render(<Hero />);
    expect(container).not.toHaveTextContent(/automated tests|live deployments|shipped projects/i);
    expect(container.querySelector("dl")).toBeNull();
  });
});
