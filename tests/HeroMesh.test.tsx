import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroMesh } from "@/components/HeroMesh";

// HeroMesh unconditionally constructs `new THREE.WebGLRenderer(...)` in its
// setup effect, and jsdom has no real WebGL context — the constructor throws,
// which HeroMesh's own try/catch treats as "no WebGL, bail out silently"
// (see the component). That makes the component impossible to exercise past
// its very first line under jsdom without a stand-in for `three`. This file
// mocks `three` with minimal, stateful stubs — never a real WebGLRenderer —
// specifically so the scroll rig's *seeding* logic (the code right after
// `ScrollTrigger.create(...)`) can actually run and be asserted on. This is
// separate from, and does not touch, the `@/components/HeroMesh` mock that
// `tests/Hero.test.tsx` and `tests/copy.test.tsx` use to avoid reaching this
// file at all — this file's whole purpose is to reach it.
vi.mock("three", () => {
  class Object3DStub {
    rotation = { x: 0, y: 0, z: 0 };
    position = {
      x: 0,
      y: 0,
      z: 0,
      set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
      },
    };
    add = vi.fn();
  }

  class Scene extends Object3DStub {}
  class Group extends Object3DStub {}

  class PerspectiveCamera extends Object3DStub {
    aspect: number;
    constructor(_fov: number, aspect: number) {
      super();
      this.aspect = aspect;
    }
    updateProjectionMatrix = vi.fn();
  }

  class BufferAttribute {
    array: Float32Array;
    itemSize: number;
    needsUpdate = false;
    constructor(array: Float32Array, itemSize: number) {
      this.array = array;
      this.itemSize = itemSize;
    }
  }

  class BufferGeometry {
    attributes: Record<string, BufferAttribute> = {};
    setAttribute(name: string, attribute: BufferAttribute) {
      this.attributes[name] = attribute;
      return this;
    }
    dispose = vi.fn();
  }

  class Color {
    r: number;
    g: number;
    b: number;
    constructor(r = 0, g = 0, b = 0) {
      this.r = r;
      this.g = g;
      this.b = b;
    }
    setRGB = vi.fn();
  }

  class MaterialStub {
    opacity: number;
    color = { setRGB: vi.fn() };
    constructor(params: { opacity?: number } = {}) {
      this.opacity = params.opacity ?? 1;
    }
    dispose = vi.fn();
  }

  class PointsMaterial extends MaterialStub {}
  class LineBasicMaterial extends MaterialStub {}

  class Points extends Object3DStub {
    constructor(
      public geometry: unknown,
      public material: unknown,
    ) {
      super();
    }
  }
  class LineSegments extends Points {}

  class WebGLRenderer {
    domElement = document.createElement("canvas");
    setPixelRatio = vi.fn();
    setSize = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
    forceContextLoss = vi.fn();
  }

  return {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    Group,
    BufferGeometry,
    BufferAttribute,
    Color,
    PointsMaterial,
    LineBasicMaterial,
    Points,
    LineSegments,
  };
});

// A controllable fake ScrollTrigger. `gsapMock.state.progress` is the
// progress the *next* `ScrollTrigger.create(...)` call should report — set it
// before `render(<HeroMesh />)`. The fake mirrors the specific real-GSAP
// behaviour finding 1 is about: `ScrollTrigger.create()` refreshes
// synchronously and, if the page is already scrolled into/past the trigger's
// range, fires `onUpdate` *during that call* — before the caller's code after
// `.create(...)` ever runs. `vi.hoisted` is required here (rather than a
// plain module-scope `let`) because Vitest hoists `vi.mock` factories above
// all imports, including any variables a plain `const`/`let` at this point in
// the file would create.
const gsapMock = vi.hoisted(() => ({
  state: { progress: 0 },
  kill: vi.fn(),
}));

vi.mock("@/lib/gsap", () => ({
  ScrollTrigger: {
    create: (config: { onUpdate?: (self: { progress: number }) => void }) => {
      config.onUpdate?.({ progress: gsapMock.state.progress });
      return { progress: gsapMock.state.progress, kill: gsapMock.kill };
    },
  },
}));

afterEach(() => {
  gsapMock.state.progress = 0;
  gsapMock.kill.mockClear();
  document.documentElement.style.removeProperty("--bg-fx-opacity");
  vi.restoreAllMocks();
});

describe("HeroMesh scroll rig seeding", () => {
  // Control case: proves the harness itself is meaningful. If this read "1"
  // regardless of the trigger's reported progress, the critical case below
  // would be worthless — this establishes that "0" is actually reachable.
  it("leaves the background canvas hidden when the trigger creates at progress 0", () => {
    gsapMock.state.progress = 0;
    render(
      <div data-hero>
        <HeroMesh />
      </div>,
    );
    expect(document.documentElement.style.getPropertyValue("--bg-fx-opacity")).toBe("0");
  });

  // The critical case (review finding 1): `ScrollTrigger.create()` refreshes
  // synchronously, and when the page is already scrolled past the hero at
  // mount time — reload/back-navigation with scroll restoration landing
  // before this dynamically-imported chunk mounts, a resize/rotation across
  // the mount breakpoint while scrolled down, or reduced motion toggling off
  // while scrolled down — it reports progress 1 immediately. The buggy
  // version of this code called `applyProgress(0)` unconditionally right
  // after creating the trigger, stomping the correct value back to 0 and
  // trapping the page with neither the 3D mesh (off-screen) nor the 2D
  // background (opacity 0) visible, until the next scroll event. The fix
  // seeds from the trigger's own real `.progress` instead of an assumed 0.
  //
  // Confirmed this test fails (times out on nothing — it assertion-fails
  // immediately, reading "0" instead of "1") against the pre-fix component,
  // and passes against the fix, by temporarily swapping in the commit
  // 20de0b8 version of components/HeroMesh.tsx and rerunning; see the task
  // report for the exact commands and output.
  it("restores the background canvas when the trigger already reports progress 1 at creation", () => {
    gsapMock.state.progress = 1;
    render(
      <div data-hero>
        <HeroMesh />
      </div>,
    );
    expect(document.documentElement.style.getPropertyValue("--bg-fx-opacity")).toBe("1");
  });
});
