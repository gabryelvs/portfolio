import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroMesh } from "@/components/HeroMesh";
import { BG_FX_OPACITY_PROPERTY } from "@/lib/mesh";

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
// Tracks every stubbed BufferGeometry created by a mounted HeroMesh, in
// creation order — HeroMesh creates the node geometry first and the link
// geometry second (see components/HeroMesh.tsx), so `geometries[0]` is
// always the node geometry whose `attributes.position.array` a test can read
// to observe the scene's actual per-frame node positions, the same
// `Float32Array` reference `writePositions()` mutates in place. `vi.hoisted`
// is required for the same reason `gsapMock` below needs it: `vi.mock`
// factories are hoisted above all imports/module-scope code.
const meshInstances = vi.hoisted(() => ({
  geometries: [] as { attributes: Record<string, { array: Float32Array }> }[],
}));

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
    constructor() {
      meshInstances.geometries.push(this);
    }
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
  meshInstances.geometries.length = 0;
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

describe("HeroMesh scroll endpoint", () => {
  // `onToggle` used to force-snap the endpoint: on `self.progress === 1` it
  // set `renderedProgress = 1`, called `applyProgress(1)` and stopped. That
  // guaranteed `--bg-fx-opacity` reached exactly `"1"`, but it reached it in
  // a single frame — at ordinary flick speeds the eased progress was still
  // far short of the 0.7 point where the background phase even begins, so
  // the crossfade became a full-viewport cut rather than a fade (a ~0.77
  // one-frame step on a 0.6s traversal).
  //
  // The endpoint now belongs to `tick`: the ease converges (guaranteed by
  // PROGRESS_SNAP_EPSILON), and only once it has actually landed does the
  // loop park. This test pins both halves of that — the exact endpoint value
  // AND the parking — by driving the rAF loop by hand. The parking assertion
  // is the regression guard for the change: with the stop still living in
  // `onToggle`, nothing on this path ever stops the loop and it keeps
  // requesting frames forever.
  it("eases --bg-fx-opacity to exactly 1, then parks the loop, once the hero is scrolled past", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    const cancelSpy = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation(() => {});

    // Mount mid-scroll, so the mesh genuinely owns the screen at creation
    // (well before the 0.7 handoff phase begins) rather than starting from
    // an edge case this test isn't about.
    gsapMock.state.progress = 0.5;
    render(
      <div data-hero>
        <HeroMesh />
      </div>,
    );
    expect(document.documentElement.style.getPropertyValue("--bg-fx-opacity")).not.toBe("1");

    // Dirty the property to a value the component could not produce by
    // coincidence (the dirty-before-assert pattern used elsewhere in this
    // codebase — see tests/Hero.test.tsx), so the final assertion is only
    // true because the rig actually drove it there.
    document.documentElement.style.setProperty("--bg-fx-opacity", "0.4");

    // The hero has fully scrolled past. Real GSAP reports this through
    // `onUpdate` off its own scroll ticker; `onToggle` is deliberately NOT
    // fired here, because a single update crossing the whole trigger range
    // toggles nothing (`isActive` is false at both progress 0 and 1) — the
    // endpoint must be reached without it.
    gsapMock.lastConfig?.onUpdate?.({ progress: 1 });

    // Drive the loop at ~60fps until it stops asking for frames. The ease
    // has a 0.15s time constant, so convergence takes well under 100 frames;
    // the cap only stops a regression from spinning this test forever.
    let now = 0;
    let framesRun = 0;
    const samples: string[] = [];
    while (frames.length > 0 && framesRun < 300) {
      const cb = frames.shift()!;
      now += 16;
      framesRun += 1;
      cb(now);
      samples.push(document.documentElement.style.getPropertyValue("--bg-fx-opacity"));
    }

    expect(document.documentElement.style.getPropertyValue("--bg-fx-opacity")).toBe("1");
    expect(frames).toHaveLength(0);
    expect(framesRun).toBeLessThan(300);

    // The loop genuinely stopped, rather than merely declining to request one
    // more frame: `stop()` cancels the pending handle too.
    expect(cancelSpy).toHaveBeenCalled();

    // The endpoint must be *eased* to, not jumped to. Without these two, the
    // test passes against a one-frame teleport — which is exactly the bug
    // this whole change exists to remove. At tau = 0.15s and 16ms frames,
    // covering the 0.5 -> 1 distance takes ~66 frames, and the background
    // phase (progress 0.7 -> 1.0) must be observed part-way rather than only
    // at its endpoints.
    expect(framesRun).toBeGreaterThan(10);
    const midFade = samples.filter((v) => {
      const n = Number(v);
      return n > 0 && n < 1;
    });
    expect(midFade.length).toBeGreaterThan(0);
  });
});

// Finding I4: components/HeroMesh.tsx:125-170 (the entranceFinished,
// entranceElapsedMs and handoffBlendElapsedMs latches) and :300-333 are the
// most intricate code in the branch, but the only test above that drives the
// rAF loop ("HeroMesh scroll endpoint") mounts at progress 0.5, where seeding
// has already called finishEntrance() — so the entrance's own fly-in and its
// handoff blend were never actually executed by any test. These two cases
// mount at progress 0 instead, so the entrance genuinely runs.
describe("HeroMesh entrance and handoff", () => {
  function nodeMagnitude(array: Float32Array, index: number): number {
    const i = index * 3;
    return Math.hypot(array[i], array[i + 1], array[i + 2]);
  }

  it("contracts node spread monotonically from 3x home radius toward 1x while the entrance plays out", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    gsapMock.state.progress = 0;
    render(
      <div data-hero>
        <HeroMesh />
      </div>,
    );

    // meshInstances.geometries[0] is the node geometry (created before the
    // link geometry — see components/HeroMesh.tsx) whose position array is
    // the exact Float32Array writePositions() mutates in place each frame.
    const nodeArray = meshInstances.geometries[0].attributes.position.array;

    // Drive frames at a steady 16ms/frame past the entrance's full 1.2s
    // window, capturing node 0's magnitude after every frame actually
    // rendered — writePositions() only runs inside tick(), so nothing before
    // the first driven frame reflects the entrance at all.
    let now = 0;
    let framesRun = 0;
    const magnitudes: number[] = [];
    while (frames.length > 0 && framesRun < 100) {
      const cb = frames.shift()!;
      now += 16;
      framesRun += 1;
      cb(now);
      magnitudes.push(nodeMagnitude(nodeArray, 0));
      if (now > 1400) break;
    }

    expect(magnitudes.length).toBeGreaterThan(10);

    // The very first driven tick has dt === 0 (start() seeds lastTickTime to
    // null), so entranceElapsedMs is still 0 and the cubic ease-out reads
    // t = 0, spread = 3 exactly. Expressing every later frame as a ratio
    // against this first one avoids needing a direct reference to the
    // (randomised per test run) home positions.
    const homeMagnitude = magnitudes[0] / 3;
    const spreadRatios = magnitudes.map((m) => m / homeMagnitude);

    expect(spreadRatios[0]).toBeCloseTo(3, 1);

    // Monotonic contraction: progress never moves off 0 in this test, so the
    // rig's own baseline spread (1, at progress 0) never overrides the
    // entrance before it finishes on its own, and the entrance's cubic
    // ease-out is monotonically decreasing by construction — no frame should
    // read a larger spread than the one before it.
    for (let i = 1; i < spreadRatios.length; i++) {
      expect(spreadRatios[i]).toBeLessThanOrEqual(spreadRatios[i - 1] + 1e-6);
    }

    // ...and it actually reaches the rig's progress-0 baseline (1x) once the
    // entrance's 1.2s window elapses, not just "smaller than before".
    expect(spreadRatios[spreadRatios.length - 1]).toBeCloseTo(1, 1);
  });

  // A scroll big enough to cross ENTRANCE_HANDOFF_PROGRESS while the entrance
  // is still mid-flight must not let the rig's baseline spread replace the
  // entrance's current spread in a single frame — that is exactly what
  // HANDOFF_BLEND_MS exists to prevent (see its comment in
  // components/HeroMesh.tsx). This proves the blend is load-bearing by
  // computing the actual frame-to-frame spread delta throughout a crossing,
  // using the same node-magnitude-ratio technique as the case above.
  it("blends the entrance into the rig's spread with no single-frame jump when scroll crosses the handoff threshold mid-entrance", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    gsapMock.state.progress = 0;
    render(
      <div data-hero>
        <HeroMesh />
      </div>,
    );

    const nodeArray = meshInstances.geometries[0].attributes.position.array;
    const spreadRatios: number[] = [];
    let homeMagnitude: number | null = null;
    let now = 0;

    function runFrame() {
      const cb = frames.shift()!;
      now += 16;
      cb(now);
      const magnitude = nodeMagnitude(nodeArray, 0);
      if (homeMagnitude === null) homeMagnitude = magnitude / 3;
      spreadRatios.push(magnitude / homeMagnitude);
    }

    // A handful of frames with the entrance still running and scroll
    // untouched (target progress 0) — well short of both the 1.2s entrance
    // window and the 0.05 handoff threshold.
    for (let i = 0; i < 5; i++) runFrame();

    // A scroll jump straight to the end, exactly as a fast flick or a
    // scrollbar drag would report through onUpdate — see the "HeroMesh
    // scroll endpoint" describe above for the same real-GSAP behaviour this
    // mirrors.
    gsapMock.lastConfig?.onUpdate?.({ progress: 1 });

    // Drive enough further frames for renderedProgress's own easing to cross
    // ENTRANCE_HANDOFF_PROGRESS and for the 400ms handoff blend window to run
    // its course (or for the loop to park at the endpoint, whichever first).
    for (let i = 0; i < 60 && frames.length > 0; i++) runFrame();

    expect(spreadRatios.length).toBeGreaterThan(20);

    let maxDelta = 0;
    for (let i = 1; i < spreadRatios.length; i++) {
      maxDelta = Math.max(maxDelta, Math.abs(spreadRatios[i] - spreadRatios[i - 1]));
    }

    // Simulating this exact scenario against an unblended version of this
    // math (handoff overwriting state.spread with the rig's baseline the
    // instant the threshold is crossed, deleting the HANDOFF_BLEND_MS
    // branch) produces a single-frame delta of about 1.7 — see the task
    // report for the simulation. 0.5 is comfortably below that and
    // comfortably above the ~0.08 the real blended code produces, so this
    // bound only passes when the blend is actually smoothing the
    // transition.
    expect(maxDelta).toBeLessThan(0.5);
  });
});

// Finding I5: tests/HeroMesh.test.tsx used to create `kill: vi.fn()` on the
// fake ScrollTrigger and clear it every afterEach, but no test ever asserted
// on it, and nothing covered the unmount cleanup or the webglcontextlost
// path at all.
describe("HeroMesh lifecycle", () => {
  it("kills the ScrollTrigger and restores --bg-fx-opacity on unmount", () => {
    gsapMock.state.progress = 0.3;
    const { unmount } = render(
      <div data-hero>
        <HeroMesh />
      </div>,
    );

    // Dirty the property first (the dirty-before-assert pattern used
    // elsewhere in this file) so the post-unmount read is only meaningful
    // because cleanup actually touched it.
    document.documentElement.style.setProperty(BG_FX_OPACITY_PROPERTY, "0.4");

    unmount();

    expect(gsapMock.kill).toHaveBeenCalledTimes(1);

    // Cleanup removes the property (finding M7) rather than setting it to
    // the literal "1": app/globals.css already defaults
    // `var(--bg-fx-opacity, 1)` to 1, so an unset property reads as 1
    // through that fallback without permanently shadowing the token with an
    // identical inline value.
    expect(document.documentElement.style.getPropertyValue(BG_FX_OPACITY_PROPERTY)).toBe("");
  });

  it("removes its resize, visibilitychange, and webglcontextlost listeners on unmount", () => {
    const windowAdd = vi.spyOn(window, "addEventListener");
    const windowRemove = vi.spyOn(window, "removeEventListener");
    const docAdd = vi.spyOn(document, "addEventListener");
    const docRemove = vi.spyOn(document, "removeEventListener");
    const canvasAdd = vi.spyOn(HTMLCanvasElement.prototype, "addEventListener");
    const canvasRemove = vi.spyOn(HTMLCanvasElement.prototype, "removeEventListener");

    gsapMock.state.progress = 0.3;
    const { unmount } = render(
      <div data-hero>
        <HeroMesh />
      </div>,
    );

    expect(windowAdd).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(docAdd).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(canvasAdd).toHaveBeenCalledWith("webglcontextlost", expect.any(Function));
    const resizeHandler = windowAdd.mock.calls.find(([type]) => type === "resize")?.[1];
    const visibilityHandler = docAdd.mock.calls.find(([type]) => type === "visibilitychange")?.[1];
    const contextLostHandler = canvasAdd.mock.calls.find(([type]) => type === "webglcontextlost")?.[1];

    unmount();

    expect(windowRemove).toHaveBeenCalledWith("resize", resizeHandler);
    expect(docRemove).toHaveBeenCalledWith("visibilitychange", visibilityHandler);
    expect(canvasRemove).toHaveBeenCalledWith("webglcontextlost", contextLostHandler);
  });

  it("stops the render loop and hands the screen back to the 2D canvas on WebGL context loss, and the latch blocks a later restart", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    gsapMock.state.progress = 0.3;
    const { container } = render(
      <div data-hero>
        <HeroMesh />
      </div>,
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();

    // Dirty the property first so the restoration below is only true because
    // onContextLost actually wrote it, not coincidence.
    document.documentElement.style.setProperty(BG_FX_OPACITY_PROPERTY, "0.4");

    const framesQueuedBeforeLoss = frames.length;
    canvas!.dispatchEvent(new Event("webglcontextlost"));

    expect(document.documentElement.style.getPropertyValue(BG_FX_OPACITY_PROPERTY)).toBe("1");
    expect(canvas!.style.opacity).toBe("0");
    expect(cancelSpy).toHaveBeenCalled();

    // The latch must prevent a later visibilitychange (e.g. a tab refocus)
    // from resurrecting the rAF loop onto a now-dead context. jsdom's
    // `document.hidden` defaults to false, so onVisibility would otherwise
    // call start() here; if the contextLost latch were missing, start()
    // would queue a new frame and this assertion would catch it.
    document.dispatchEvent(new Event("visibilitychange"));
    expect(frames.length).toBeLessThanOrEqual(framesQueuedBeforeLoss);
  });
});
