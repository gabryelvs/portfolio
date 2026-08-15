import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackgroundFX } from "@/components/BackgroundFX";
import { BG_FX_OPACITY_PROPERTY } from "@/lib/mesh";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BackgroundFX", () => {
  it("renders a decorative canvas", () => {
    const { container } = render(<BackgroundFX />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
  });

  // Finding I2: the producer side of the --bg-fx-opacity handoff (HeroMesh's
  // scroll rig) is well covered, but nothing asserted that the consumer
  // (this canvas) actually reads the variable — deleting the inline style
  // entirely left all other tests green while the feature's central visual
  // idea (the 3D hero handing the screen back to this canvas) went silently
  // dead. Assert the style directly, via the shared constant so this test
  // and the component can't drift apart on the property name.
  it("ties its opacity to the --bg-fx-opacity handoff variable", () => {
    const { container } = render(<BackgroundFX />);
    const canvas = container.querySelector("canvas");
    expect(canvas?.style.opacity).toBe(`var(${BG_FX_OPACITY_PROPERTY}, 1)`);
  });

  it("does not throw when no 2D context is available", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(() => render(<BackgroundFX />)).not.toThrow();
  });

  // Named for exactly what this asserts, same rationale as the equivalent
  // rename in tests/Reveal.test.tsx: RTL's unmount() removes the subtree
  // entirely, so this can only prove the effect cleanup (cancelAnimationFrame,
  // listener removal, observer disconnect) doesn't throw — not that anything
  // stays visible.
  it("does not throw when unmounted", () => {
    const { unmount } = render(<BackgroundFX />);
    expect(() => unmount()).not.toThrow();
  });
});
