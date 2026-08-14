import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackgroundFX } from "@/components/BackgroundFX";

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

  it("does not throw when no 2D context is available", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(() => render(<BackgroundFX />)).not.toThrow();
  });

  it("unmounts cleanly", () => {
    const { unmount } = render(<BackgroundFX />);
    expect(() => unmount()).not.toThrow();
  });
});
