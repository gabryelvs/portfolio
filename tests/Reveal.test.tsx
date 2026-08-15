import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "@/components/Reveal";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { stubReducedMotion } from "./helpers";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  // Triggers self-clean in real use (once:true, or ctx.revert() on unmount), but
  // guard explicitly so a trigger from one test can never leak into the next.
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
});

describe("Reveal", () => {
  it("renders its children under reduced motion", () => {
    stubReducedMotion(true);
    render(<Reveal>visible content</Reveal>);
    expect(screen.getByText("visible content")).toBeInTheDocument();
  });

  // Binding constraint: under reduced motion there is no animation and no
  // ScrollTrigger registration at all. The prior tests only checked that
  // children render, which holds in both branches and would pass even if the
  // prefersReducedMotion() gate in Reveal.tsx were deleted entirely.
  it("registers no ScrollTrigger under reduced motion", () => {
    stubReducedMotion(true);
    const createSpy = vi.spyOn(ScrollTrigger, "create");
    render(<Reveal>visible content</Reveal>);
    expect(createSpy).not.toHaveBeenCalled();
    expect(ScrollTrigger.getAll()).toHaveLength(0);
  });

  it("renders its children with motion enabled", () => {
    stubReducedMotion(false);
    render(<Reveal>visible content</Reveal>);
    expect(screen.getByText("visible content")).toBeInTheDocument();
  });

  // Counterpart to the reduced-motion case above: with motion enabled, Reveal
  // must actually register a ScrollTrigger for the revealed element.
  //
  // ScrollTrigger.getAll() is NOT used here (despite being the natural probe)
  // because it does not hold empirically under jsdom: Reveal's tween uses
  // `once: true`, and jsdom's getBoundingClientRect always returns zeros (no
  // real layout), so the trigger's start point ("top 85%") reads as already
  // passed the instant it's created. GSAP fires it and removes it from
  // ScrollTrigger.getAll() synchronously, before this test ever gets to look —
  // asserting getAll() were non-empty here would be false. Spying on
  // ScrollTrigger.create() instead observes the registration call itself,
  // which is what the "no ScrollTrigger registration at all" constraint is
  // actually about, and is unaffected by the immediate self-removal.
  it("registers a ScrollTrigger with motion enabled", () => {
    stubReducedMotion(false);
    const createSpy = vi.spyOn(ScrollTrigger, "create");
    render(<Reveal>visible content</Reveal>);
    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  // Finding I3: `gsap.fromTo` applies its *from* state immediately, so at
  // assertion time under jsdom the revealed content is genuinely at
  // opacity: 0 — and the tests above pass regardless, since they assert
  // `textContent`/`toBeInTheDocument()`/registration calls, none of which is
  // affected by opacity. Without this test, a regression leaving every
  // `Reveal`-wrapped section (the project cards) permanently invisible in a
  // real browser would be caught by nothing here. This is the same binding
  // constraint as the equivalent test in tests/Hero.test.tsx: the animation
  // must actually be capable of reaching full visibility, even though jsdom
  // never runs it.
  it("tweens its content from hidden to fully visible", () => {
    stubReducedMotion(false);
    const fromToSpy = vi.spyOn(gsap, "fromTo");
    render(<Reveal>visible content</Reveal>);
    expect(fromToSpy).toHaveBeenCalledTimes(1);
    const [, from, to] = fromToSpy.mock.calls[0];
    expect(from).toMatchObject({ opacity: 0, y: 18 });
    expect(to).toMatchObject({ opacity: 1, y: 0 });
  });

  // Named for exactly what this asserts: RTL's unmount() removes the whole
  // subtree, so this cannot actually observe post-unmount visibility — only
  // that ctx.revert() (see Reveal.tsx) doesn't throw while tearing down a
  // live tween/ScrollTrigger.
  it("does not throw when unmounted mid-animation", () => {
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
