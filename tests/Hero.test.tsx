import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Hero } from "@/components/Hero";
import { gsap } from "@/lib/gsap";
import { fireReducedMotionChange, stubReducedMotion } from "./helpers";

// The real HeroMesh is swapped for a trivial, synchronous stand-in for every
// test in this file. Two reasons:
//
// 1. HeroMesh assumes it is only ever mounted once Hero's gate has already
//    passed, and unconditionally attempts `new THREE.WebGLRenderer(...)` in
//    its setup effect. jsdom has no real WebGL context, so the only way to
//    guarantee no test here reaches that construction — including the "hero
//    mesh gate" tests below, which deliberately probe both the open and
//    closed side of the gate — is to never load the real module.
// 2. It gives the gate tests a `data-testid` to assert on directly, instead
//    of reaching into HeroMesh's internal markup.
vi.mock("@/components/HeroMesh", () => ({
  HeroMesh: () => <div data-testid="hero-mesh-mount" aria-hidden="true" />,
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  // Inline styles set directly on `documentElement` (as `--bg-fx-opacity` is,
  // by both Hero's gate effect and HeroMesh's own rig) are not touched by
  // `vi.unstubAllGlobals()` — they are real DOM state, not a stubbed global —
  // so without an explicit reset here a value one test sets survives into
  // the next test and can make an assertion pass for the wrong reason. See
  // the "unmounts the mesh on a resize back below the breakpoint" test for a
  // case that bit this before the reset existed.
  document.documentElement.style.removeProperty("--bg-fx-opacity");
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

  // The WebGL hero mesh's mount gate. This used to live inside HeroMesh itself
  // (tests/HeroMesh.test.tsx); it now lives in Hero (see components/Hero.tsx),
  // so Hero only ever renders <HeroMesh /> once `shouldRenderMesh` has already
  // passed — the lazily-imported three.js module is never requested otherwise.
  //
  // next/dynamic's ssr:false wrapping uses React.lazy + Suspense internally
  // (node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js), with a null
  // fallback. That means a correctly-mounted mesh is *also* absent from the
  // DOM in the render() call's initial, synchronous commit — it only appears
  // after the dynamic import's promise resolves, at least one microtask tick
  // later. A bare synchronous assertion right after render() would therefore
  // report "absent" whether the gate is correctly closed or has regressed
  // wide open, making it useless for catching a regression. `await
  // act(async () => {})` flushes that tick deterministically before each
  // assertion below, so "does not mount" and "does mount" actually diverge.
  describe("hero mesh gate", () => {
    it("does not mount the hero mesh below the breakpoint", async () => {
      stubReducedMotion(false, 500);
      render(<Hero />);
      await act(async () => {});
      expect(screen.queryByTestId("hero-mesh-mount")).toBeNull();
    });

    it("does not mount the hero mesh under reduced motion on a wide viewport", async () => {
      stubReducedMotion(true, 1440);
      render(<Hero />);
      await act(async () => {});
      expect(screen.queryByTestId("hero-mesh-mount")).toBeNull();
    });

    // Positive counterpart to the two cases above: proves the flush pattern
    // itself is meaningful (i.e. that it isn't just always-null regardless of
    // the gate) and that the gate isn't accidentally inverted.
    it("mounts the hero mesh at the breakpoint with motion allowed", async () => {
      stubReducedMotion(false, 1024);
      render(<Hero />);
      await act(async () => {});
      expect(screen.queryByTestId("hero-mesh-mount")).not.toBeNull();
    });

    // Task 6 makes --bg-fx-opacity real: the mesh's own scroll rig (and its
    // unmount) are what drive it, and the gate effect resets it too the
    // moment it closes. Dirtying the value before render — rather than just
    // checking it's untouched — is what makes this a genuine assertion on
    // the reset instead of a check that would pass even if nothing ever
    // wrote the property at all.
    it("resets the background canvas opacity to 1 when the mesh is gated off", () => {
      stubReducedMotion(false, 500);
      document.documentElement.style.setProperty("--bg-fx-opacity", "0.4");
      render(<Hero />);
      expect(document.documentElement.style.getPropertyValue("--bg-fx-opacity")).toBe("1");
    });

    // Neither re-evaluation path (resize, live reduced-motion change) was
    // previously covered — both are exercised here by firing the real event
    // inside `act` and checking the mesh actually mounts/unmounts in
    // response, not just on the initial synchronous evaluation.
    it("mounts the mesh on a resize across the breakpoint", async () => {
      stubReducedMotion(false, 500);
      render(<Hero />);
      await act(async () => {});
      expect(screen.queryByTestId("hero-mesh-mount")).toBeNull();

      vi.stubGlobal("innerWidth", 1024);
      await act(async () => {
        window.dispatchEvent(new Event("resize"));
      });
      expect(screen.queryByTestId("hero-mesh-mount")).not.toBeNull();
    });

    it("unmounts the mesh on a resize back below the breakpoint, restoring the background", async () => {
      stubReducedMotion(false, 1024);
      render(<Hero />);
      await act(async () => {});
      expect(screen.queryByTestId("hero-mesh-mount")).not.toBeNull();

      // Dirty the value before resizing — otherwise, since this mocked
      // HeroMesh never writes --bg-fx-opacity itself, the assertion below
      // would pass even if the gate's reset were deleted entirely, simply
      // because the property was never touched (or was left at "1" by a
      // previous test, before the afterEach reset covered that case).
      document.documentElement.style.setProperty("--bg-fx-opacity", "0.4");

      vi.stubGlobal("innerWidth", 500);
      await act(async () => {
        window.dispatchEvent(new Event("resize"));
      });
      expect(screen.queryByTestId("hero-mesh-mount")).toBeNull();
      expect(document.documentElement.style.getPropertyValue("--bg-fx-opacity")).toBe("1");
    });

    it("unmounts the mesh when reduced-motion is turned on live", async () => {
      const media = stubReducedMotion(false, 1024);
      render(<Hero />);
      await act(async () => {});
      expect(screen.queryByTestId("hero-mesh-mount")).not.toBeNull();

      await act(async () => {
        fireReducedMotionChange(media, true);
      });
      expect(screen.queryByTestId("hero-mesh-mount")).toBeNull();
    });

    it("mounts the mesh when reduced-motion is turned off live", async () => {
      const media = stubReducedMotion(true, 1024);
      render(<Hero />);
      await act(async () => {});
      expect(screen.queryByTestId("hero-mesh-mount")).toBeNull();

      await act(async () => {
        fireReducedMotionChange(media, false);
      });
      expect(screen.queryByTestId("hero-mesh-mount")).not.toBeNull();
    });
  });
});
