import { cleanup, render } from "@testing-library/react";
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
type FakeSelf = { progress: number };
type FakeConfig = {
  onUpdate?: (self: FakeSelf) => void;
  onToggle?: (self: FakeSelf) => void;
};

const gsapMock = vi.hoisted(() => ({
  state: { progress: 0 },
  kill: vi.fn(),
  // The config object passed to the most recent `ScrollTrigger.create(...)`
  // call, so a test can simulate scroll activity *after* HeroMesh has
  // mounted — a later `onUpdate`, or the `onToggle` endpoint force-snap —
  // the same way real GSAP would invoke these callbacks off its own ticker.
  lastConfig: null as FakeConfig | null,
}));

vi.mock("@/lib/gsap", () => ({
  ScrollTrigger: {
    create: (config: FakeConfig) => {
      gsapMock.lastConfig = config;
      // Real GSAP's synchronous refresh inside `ScrollTrigger.create()`
      // only invokes `onUpdate` when the freshly-computed progress differs
      // from the trigger's own starting value (0) — a trigger that already
      // reads progress 0 at creation has nothing to report, since nothing
      // changed from its default. Firing unconditionally here (as an
      // earlier version of this fake did) would let a regression that seeds
      // solely from the `onUpdate` callback — and never reads
      // `scrollTrigger.progress` directly, the actual bug finding 1 was
      // about — pass anyway, since `onUpdate` would always fire regardless
      // of which mechanism the component used. Gating on this same
      // condition is what makes the "critical case" test below a genuine
      // regression guard rather than a tautology.
      if (gsapMock.state.progress !== 0) {
        config.onUpdate?.({ progress: gsapMock.state.progress });
      }
      return { progress: gsapMock.state.progress, kill: gsapMock.kill };
    },
  },
}));

afterEach(() => {
  // Explicit, ordered cleanup rather than relying on the relative order of
  // this hook and React Testing Library's own auto-registered
  // `afterEach(cleanup)` (a side effect of importing `render` above, active
  // because Vitest's `globals: true` exposes a global `afterEach` for RTL to
  // hook). Unmounting HeroMesh runs its own effect cleanup, which sets
  // `--bg-fx-opacity` back to `"1"` — if that unmount happened *after* the
  // `removeProperty` below (whichever way Vitest happens to order same-level
  // `afterEach` hooks from different modules), the reset here would be
  // clobbered and leak `"1"` into the next test regardless of what that test
  // itself does. Calling `cleanup()` here first makes the unmount happen at
  // a known point relative to the reset, independent of hook registration
  // order; RTL's own auto-cleanup afterward is then a harmless no-op on an
  // already-unmounted tree.
  cleanup();
  gsapMock.state.progress = 0;
  gsapMock.lastConfig = null;
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

describe("HeroMesh onToggle endpoint", () => {
  // Review finding 6b: `onToggle`'s force-snap (see the component: on
  // `self.progress === 1` it sets `renderedProgress = 1` and calls
  // `applyProgress(1)` directly, before `stop()`) is the *only* mechanism
  // that guarantees `--bg-fx-opacity` reaches exactly `"1"` once the hero
  // has fully scrolled past on the ordinary scroll path — the eased
  // `renderedProgress` driven by `onUpdate` only ever approaches 1
  // asymptotically. That force-snap had zero test coverage before this.
  it("snaps --bg-fx-opacity to exactly 1 when onToggle reports the hero fully scrolled past", () => {
    // Mount mid-scroll, so the mesh genuinely owns the screen at creation
    // (well before the 0.7 handoff phase even begins) rather than starting
    // from an edge case this test isn't about.
    gsapMock.state.progress = 0.5;
    render(
      <div data-hero>
        <HeroMesh />
      </div>,
    );
    expect(document.documentElement.style.getPropertyValue("--bg-fx-opacity")).not.toBe("1");
    // Dirty the property to a value `onToggle` could not produce by
    // coincidence (matching the dirty-before-assert pattern used elsewhere
    // in this codebase for the same reason — see tests/Hero.test.tsx), so
    // the final assertion is only true because `onToggle`'s handler
    // actually ran, not because the property already happened to read "1".
    document.documentElement.style.setProperty("--bg-fx-opacity", "0.4");

    // Real GSAP invokes `onToggle` off its own scroll ticker whenever the
    // trigger's active/progress state changes — simulate the hero having
    // just fully scrolled past.
    gsapMock.lastConfig?.onToggle?.({ progress: 1 });

    expect(document.documentElement.style.getPropertyValue("--bg-fx-opacity")).toBe("1");
  });
});
