import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Hero } from "@/components/Hero";
import { gsap } from "@/lib/gsap";
import { stubReducedMotion } from "./helpers";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Hero", () => {
  // Binding constraint: under reduced motion there is no entrance animation at
  // all. tests/copy.test.tsx only checks text content, which would still pass
  // if the prefersReducedMotion() gate in Hero.tsx were deleted, or if the
  // entrance tween left content stuck at opacity: 0.
  //
  // Hero builds its timeline with `gsap.fromTo(...)` inside `gsap.context()`,
  // a different call path from Reveal's ScrollTrigger-based reveal, so the
  // probe was re-derived rather than reused. Empirically (see probe run):
  // ScrollTrigger.getAll() is irrelevant here since Hero never touches
  // ScrollTrigger. Spying directly on `gsap.fromTo` — the call Hero actually
  // makes — gave a clean signal: 0 calls under reduced motion, exactly 1 call
  // with motion enabled. That's the probe used below.
  it("creates no GSAP tween under reduced motion", () => {
    stubReducedMotion(true);
    const fromToSpy = vi.spyOn(gsap, "fromTo");
    render(<Hero />);
    expect(fromToSpy).not.toHaveBeenCalled();
  });

  // Counterpart to the reduced-motion case above: with motion enabled, Hero
  // must actually build its entrance tween.
  it("creates a GSAP tween with motion enabled", () => {
    stubReducedMotion(false);
    const fromToSpy = vi.spyOn(gsap, "fromTo");
    render(<Hero />);
    expect(fromToSpy).toHaveBeenCalledTimes(1);
  });

  // Structural contract that Tasks 5 and 6 build on: the WebGL hero mesh and
  // scroll choreography key off this section's id/data attributes, and the
  // entrance tween targets every [data-hero-item] element.
  describe("structural contract", () => {
    it("marks the section with id=top, data-hero, and the relative class", () => {
      stubReducedMotion(true);
      const { container } = render(<Hero />);
      const section = container.querySelector("section");
      expect(section).not.toBeNull();
      expect(section).toHaveAttribute("id", "top");
      expect(section).toHaveAttribute("data-hero");
      expect(section).toHaveClass("relative");
    });

    it("marks exactly five elements with data-hero-item", () => {
      stubReducedMotion(true);
      const { container } = render(<Hero />);
      expect(container.querySelectorAll("[data-hero-item]")).toHaveLength(5);
    });
  });
});
