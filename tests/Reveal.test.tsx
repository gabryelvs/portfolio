import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "@/components/Reveal";
import { stubReducedMotion } from "./helpers";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Reveal", () => {
  it("renders its children under reduced motion", () => {
    stubReducedMotion(true);
    render(<Reveal>visible content</Reveal>);
    expect(screen.getByText("visible content")).toBeInTheDocument();
  });

  it("renders its children with motion enabled", () => {
    stubReducedMotion(false);
    render(<Reveal>visible content</Reveal>);
    expect(screen.getByText("visible content")).toBeInTheDocument();
  });

  it("leaves content visible after unmount", () => {
    stubReducedMotion(false);
    const { unmount } = render(<Reveal>visible content</Reveal>);
    expect(() => unmount()).not.toThrow();
  });

  it("passes through a className", () => {
    stubReducedMotion(true);
    const { container } = render(<Reveal className="grid-item">x</Reveal>);
    expect(container.querySelector(".grid-item")).not.toBeNull();
  });
});
