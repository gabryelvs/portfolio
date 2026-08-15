import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroMesh } from "@/components/HeroMesh";
import { stubReducedMotion } from "./helpers";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HeroMesh gate", () => {
  it("renders nothing below the breakpoint", () => {
    stubReducedMotion(false, 500);
    const { container } = render(<HeroMesh />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing under reduced motion on a wide viewport", () => {
    stubReducedMotion(true, 1440);
    const { container } = render(<HeroMesh />);
    expect(container.firstChild).toBeNull();
  });

  it("leaves the background canvas at full opacity when gated off", () => {
    stubReducedMotion(false, 500);
    render(<HeroMesh />);
    expect(
      document.documentElement.style.getPropertyValue("--bg-fx-opacity"),
    ).not.toBe("0");
  });
});
