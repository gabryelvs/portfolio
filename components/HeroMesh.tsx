"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { ScrollTrigger } from "@/lib/gsap";
import {
  clampDpr,
  HERO_LINK_DISTANCE,
  HERO_NODE_COUNT,
  heroScrollState,
  linkPairs,
  parseAccent,
  type Point,
} from "@/lib/mesh";

/** A 3D evolution of the site's service-mesh motif: nodes on a rough spherical
 *  shell, linked where they are close. Desktop-only, motion-allowed-only; the 2D
 *  BackgroundFX canvas is the fallback everywhere else.
 *
 *  The mount gate (viewport width + reduced motion) lives in the caller
 *  (`Hero`), not here — see `shouldRenderMesh` in `@/lib/mesh`. This component
 *  assumes it is only ever rendered once that gate has already passed, so it
 *  never has to duplicate the decision and never downloads/parses three.js
 *  before the gate says yes. */
export function HeroMesh({ className }: { className?: string }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      // No WebGL: leave the 2D background canvas as the hero visual.
      return;
    }

    renderer.setPixelRatio(clampDpr(window.devicePixelRatio || 1));
    // Let three set canvas.style.width/height (updateStyle defaults to true) so
    // the CSS box stays at the host's size even when the drawing buffer is
    // scaled up by devicePixelRatio. Passing `false` here (as this used to)
    // leaves the canvas laid out at its drawing-buffer size instead of its CSS
    // size, so on any 2x display the canvas renders twice as big as the hero,
    // anchored top-left, and spills out of the section.
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      host.clientWidth / Math.max(host.clientHeight, 1),
      0.1,
      100,
    );
    camera.position.set(0, 0, 14);

    const group = new THREE.Group();
    scene.add(group);

    // Home positions: a flattened spherical shell, so the mesh reads as a volume
    // rather than a ball. Every frame's positions are home * spread.
    const home = new Float32Array(HERO_NODE_COUNT * 3);
    const homePoints: Point[] = [];
    for (let i = 0; i < HERO_NODE_COUNT; i++) {
      const radius = 5 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.7;
      const z = radius * Math.cos(phi);
      home[i * 3] = x;
      home[i * 3 + 1] = y;
      home[i * 3 + 2] = z;
      homePoints.push({ x, y, z });
    }

    // Link topology is computed once from the home positions and then held fixed,
    // so dispersing the nodes stretches the existing links instead of rewiring
    // the graph every frame.
    const links = linkPairs(homePoints, HERO_LINK_DISTANCE);

    const nodePositions = new Float32Array(home);
    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));

    const linkPositions = new Float32Array(links.length * 6);
    const linkGeometry = new THREE.BufferGeometry();
    linkGeometry.setAttribute("position", new THREE.BufferAttribute(linkPositions, 3));

    const [r, g, b] = parseAccent(
      getComputedStyle(document.documentElement).getPropertyValue("--accent"),
    );
    const accent = new THREE.Color(r / 255, g / 255, b / 255);

    const nodeMaterial = new THREE.PointsMaterial({
      color: accent,
      size: 0.14,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const linkMaterial = new THREE.LineBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });

    group.add(new THREE.Points(nodeGeometry, nodeMaterial));
    group.add(new THREE.LineSegments(linkGeometry, linkMaterial));

    // Single source of animated truth. The scroll rig (`applyProgress`, below)
    // writes `spread`, `linkOpacity` and `cameraZ`; the entrance tween writes
    // `spread` too, until the rig takes over — see `entranceFinished`.
    // Overwritten synchronously before the first paint by the scroll rig's
    // own seeding step further down, so the literal values here only matter
    // as a sane fallback.
    const state = { spread: 1, linkOpacity: 0.28, cameraZ: 14 };
    const ENTRANCE_MS = 1200;
    // Scroll progress (post-smoothing — see `renderedProgress`) past which
    // the entrance is considered superseded by the scroll rig.
    const ENTRANCE_HANDOFF_PROGRESS = 0.05;
    // Entrance progress is tracked as accumulated animated (rAF delta) time,
    // not wall-clock time. Browsers do not deliver rAF to hidden tabs, so a
    // wall-clock start timestamp captured at setup would already be "expired"
    // by the time a background tab is foregrounded, skipping the fly-in
    // entirely. Accumulating deltas between actual tick() calls means the
    // entrance only progresses while frames are actually being drawn.
    let entranceElapsedMs = 0;
    let lastTickTime: number | null = null;
    // One-way latch: once true, the entrance never writes `state.spread`
    // again, no matter what scroll does afterwards. Without this, gating the
    // entrance's *write* on the current progress alone (as opposed to
    // permanently retiring it) let `entranceElapsedMs` keep accumulating in
    // the background while suppressed; scrolling back above the threshold
    // later would then resume the entrance from that stale-but-still-mid-
    // flight elapsed time, popping `state.spread` back up instead of leaving
    // it under the rig's control for good.
    let entranceFinished = false;

    // Window (ms of animated time, accumulated the same delta-time way as
    // `entranceElapsedMs` and for the same reason — rAF doesn't run in
    // hidden tabs) over which the entrance's last `state.spread` value is
    // faded into the rig's own value once the handoff happens naturally in
    // `tick`, below, instead of being replaced in a single frame. Without
    // this, the handoff frame itself can jump `state.spread` by a lot: the
    // entrance starts nodes at 3x the rig's baseline spread of 1 and only
    // comes within 0.2 of it after ~640ms (spread = 3 - 2*(1-(1-t)^3), t =
    // elapsed/1200), so a user who starts scrolling immediately on landing
    // crosses the 0.05 handoff threshold around 400ms in, while the
    // entrance's own spread is still around 1.6 — roughly a 60%-of-radius
    // contraction on one frame if taken uneased. `handoffBlendElapsedMs`
    // starts at `HANDOFF_BLEND_MS` (i.e. "no blend pending") precisely so a
    // handoff that happens before any entrance frame ever actually rendered
    // — mounting mid-scroll, seeded directly from real progress below —
    // does not spuriously blend from a value nothing ever drew.
    const HANDOFF_BLEND_MS = 400;
    let handoffBlendElapsedMs = HANDOFF_BLEND_MS;
    let handoffBlendFromSpread = 1;

    function finishEntrance() {
      entranceFinished = true;
      entranceElapsedMs = ENTRANCE_MS;
    }

    function writePositions() {
      for (let i = 0; i < HERO_NODE_COUNT * 3; i++) {
        nodePositions[i] = home[i] * state.spread;
      }
      for (let i = 0; i < links.length; i++) {
        const a = links[i].a * 3;
        const c = links[i].b * 3;
        linkPositions[i * 6] = nodePositions[a];
        linkPositions[i * 6 + 1] = nodePositions[a + 1];
        linkPositions[i * 6 + 2] = nodePositions[a + 2];
        linkPositions[i * 6 + 3] = nodePositions[c];
        linkPositions[i * 6 + 4] = nodePositions[c + 1];
        linkPositions[i * 6 + 5] = nodePositions[c + 2];
      }
      nodeGeometry.attributes.position.needsUpdate = true;
      linkGeometry.attributes.position.needsUpdate = true;
    }

    let raf = 0;
    let running = false;
    // Set once a WebGL context loss fires. A later visibilitychange must not
    // restart the rAF loop onto a dead context — that would spin a no-op loop
    // forever behind an invisible canvas.
    let contextLost = false;

    // GSAP builds a scrub tween only when a ScrollTrigger has an `animation`
    // attached (ScrollTrigger.js, `scrubTween` creation). This trigger has
    // none, so the number below buys no smoothing — `tick` does all of it,
    // using PROGRESS_EASE_SECONDS. What `scrub`'s *presence* changes is
    // `isToggle` (`isToggle = !scrub && scrub !== 0`), which selects which
    // branch calls `onUpdate`; either way `onUpdate` still fires as scroll
    // progress changes, so dropping `scrub` would not freeze
    // `targetProgress`. It is kept because a scrubbed trigger is what this
    // rig actually is. The specific value has no effect of its own —
    // any truthy value (or `0`) behaves identically — so it must NOT be read
    // as, or reused as, the actual smoothing time constant: that is a
    // different quantity with different units of meaning to GSAP than to
    // this loop, and conflating the two (an earlier version of this file
    // shared one constant between them) is exactly how the smoothing bug
    // below arose.
    const GSAP_SCRUB_OPTION = 0.6;
    // Smoothing time constant (seconds) for `tick`'s own exponential-decay
    // easing of `renderedProgress` toward `targetProgress`, below. An
    // exponential decay with time constant τ reaches only ~63% of the way
    // to its target after τ seconds and needs about 5τ to fully converge —
    // so this must be small relative to a typical scroll traversal, not
    // equal to some GSAP-side "feels like 0.6s" duration. At τ = 0.6, a
    // ~1.5s scroll across the hero (an ordinary scroll speed) leaves
    // `renderedProgress` around 0.63 at the moment true progress hits 1 —
    // short of 0.7, where the background handoff even begins — so
    // `onToggle`'s endpoint force-snap would visibly jump `--bg-fx-opacity`
    // from ~0 to 1 in a single frame instead of the crossfade playing. At
    // τ = 0.15 (5τ = 0.75s, comfortably inside ordinary scroll speeds) the
    // same 1.5s traversal reaches ~0.90 instead, well past the handoff
    // start, while still smoothing out per-frame scroll jitter.
    const PROGRESS_EASE_SECONDS = 0.15;
    // Once the eased progress is within this of its target, snap to the
    // target exactly. Exponential easing only ever approaches a target
    // asymptotically — without a snap, --bg-fx-opacity would ease toward 1
    // and stop just short of it instead of actually reaching 1.
    const PROGRESS_SNAP_EPSILON = 0.0005;
    // Raw scroll progress as last reported by ScrollTrigger's onUpdate —
    // the smoothing *target*.
    let targetProgress = 0;
    // Progress actually applied to the scene each frame, eased toward
    // `targetProgress` in `tick`. Seeded from the trigger's real progress
    // once it exists, below — never assumed to start at 0.
    let renderedProgress = 0;
    // Last background opacity actually written to the DOM, so repeated
    // identical writes (most frames, once settled) don't touch
    // `--bg-fx-opacity` and invalidate document-wide style for no reason.
    let lastBackgroundOpacity: number | null = null;

    function applyProgress(p: number) {
      const derived = heroScrollState(p);
      state.cameraZ = derived.cameraZ;
      state.spread = derived.spread;
      state.linkOpacity = derived.linkOpacity;
      nodeMaterial.opacity = derived.nodeOpacity;
      if (derived.backgroundOpacity !== lastBackgroundOpacity) {
        lastBackgroundOpacity = derived.backgroundOpacity;
        document.documentElement.style.setProperty(
          "--bg-fx-opacity",
          String(derived.backgroundOpacity),
        );
      }
    }

    function tick(now: number) {
      const dt = lastTickTime === null ? 0 : now - lastTickTime;
      lastTickTime = now;

      // Scrub smoothing: ease the rendered progress toward the latest raw
      // scroll target, frame-rate independently (exponential decay toward
      // the target with time constant PROGRESS_EASE_SECONDS).
      const remaining = targetProgress - renderedProgress;
      if (remaining !== 0) {
        // dt === 0 is the first frame after every start()/restart, which sets
        // lastTickTime = null. No time has passed, so nothing should move:
        // the factor is 0, not 1. With 1, that frame teleported
        // renderedProgress straight onto targetProgress with no smoothing —
        // on scroll-up re-entry after the loop parked at progress 1, a fast
        // upward flick popped the background 1 -> 0 in a single frame.
        const ease = dt > 0 ? 1 - Math.exp(-dt / (PROGRESS_EASE_SECONDS * 1000)) : 0;
        renderedProgress += remaining * ease;
        if (Math.abs(targetProgress - renderedProgress) < PROGRESS_SNAP_EPSILON) {
          renderedProgress = targetProgress;
        }
      }

      // A scroll that comes to rest a hair short of the end — progress
      // 0.9997, one pixel of the hero still in range — would otherwise
      // converge there and leave the loop running forever, rendering nodes
      // at an opacity of about 0.001. `tick` is now the only thing that
      // stops the loop, so treat "converged within the snap epsilon of the
      // end" as the end.
      if (renderedProgress === targetProgress && targetProgress >= 1 - PROGRESS_SNAP_EPSILON) {
        targetProgress = 1;
        renderedProgress = 1;
      }

      // Entrance-to-rig handoff: one-way. The instant the eased progress
      // reaches the threshold, the entrance is retired for good (see
      // `entranceFinished`'s own comment) rather than merely skipped for
      // this frame. Capture the entrance's last spread value first so the
      // blend below (see `HANDOFF_BLEND_MS`) has a continuous starting
      // point instead of picking up wherever the rig's own value happens to
      // be.
      if (!entranceFinished && renderedProgress >= ENTRANCE_HANDOFF_PROGRESS) {
        handoffBlendFromSpread = state.spread;
        handoffBlendElapsedMs = 0;
        finishEntrance();
      }

      applyProgress(renderedProgress);

      // Entrance: nodes fly in from 3x their home radius over 1.2s of
      // actually animated time, ease-out cubic. Runs only until handed off
      // (see above) or naturally complete; applied after `applyProgress` so
      // it overrides the rig's own baseline spread value for these frames,
      // the same way the rig overrides it for every frame after the
      // handoff.
      if (!entranceFinished) {
        entranceElapsedMs = Math.min(entranceElapsedMs + dt, ENTRANCE_MS);
        const t = entranceElapsedMs / ENTRANCE_MS;
        const eased = 1 - Math.pow(1 - t, 3);
        state.spread = 3 - 2 * eased;
        if (entranceElapsedMs >= ENTRANCE_MS) finishEntrance();
      } else if (handoffBlendElapsedMs < HANDOFF_BLEND_MS) {
        // Blend the entrance's last value into the rig's own value — already
        // written to `state.spread` by `applyProgress`, above — over
        // `HANDOFF_BLEND_MS` instead of taking it in a single frame. Linear
        // in blend-elapsed time, so it stays monotonic between the two
        // values (no overshoot) and is frame-rate independent the same way
        // the entrance and the scrub easing above are. Once
        // `handoffBlendElapsedMs` reaches `HANDOFF_BLEND_MS` this branch
        // stops running and `state.spread` is simply whatever `applyProgress`
        // wrote — the rig has fully taken over.
        handoffBlendElapsedMs = Math.min(handoffBlendElapsedMs + dt, HANDOFF_BLEND_MS);
        const blendT = handoffBlendElapsedMs / HANDOFF_BLEND_MS;
        state.spread = handoffBlendFromSpread + (state.spread - handoffBlendFromSpread) * blendT;
      }

      group.rotation.y += 0.0008;
      camera.position.z = state.cameraZ;
      linkMaterial.opacity = state.linkOpacity;
      writePositions();
      renderer.render(scene, camera);

      // The hero is fully scrolled away and the easing has converged, so the
      // frame just rendered is the true endpoint: park the loop rather than
      // burn frames on an off-screen canvas. Stopping here rather than in
      // onToggle is what lets the crossfade actually play — onToggle used to
      // force-snap to the endpoint the moment the hero cleared the viewport,
      // which stepped --bg-fx-opacity in one frame (a full 0 -> 1 jump on a
      // ~0.4s flick) instead of fading. Convergence to within
      // PROGRESS_SNAP_EPSILON takes tau * ln(distance / epsilon) — about
      // seven time constants, so roughly a second, not the five tau a
      // decay's usual rule of thumb would suggest.
      if (targetProgress === 1 && renderedProgress === 1) {
        stop();
        return;
      }

      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running || contextLost) return;
      running = true;
      // Discard any elapsed wall-clock time since the last tick (e.g. a
      // visibility pause) so the next dt is measured from here, not from
      // whenever tick() last ran.
      lastTickTime = null;
      raf = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function onVisibility() {
      if (document.hidden) {
        stop();
        return;
      }
      // Mirror `onToggle`'s own on-screen test (`progress < 1`, not
      // `isActive` — see its comment) rather than restarting unconditionally.
      // Without this, refocusing a tab after the hero has fully scrolled
      // away (the loop already stopped, deliberately, by `onToggle`) would
      // resurrect the rAF loop and run it forever rendering an off-screen,
      // invisible canvas every frame until the next scroll-driven toggle.
      if (renderedProgress < 1) start();
    }

    function onResize() {
      renderer.setSize(host!.clientWidth, host!.clientHeight);
      camera.aspect = host!.clientWidth / Math.max(host!.clientHeight, 1);
      camera.updateProjectionMatrix();
    }

    // Scroll choreography, scrubbed against the hero section's own progress
    // via `heroScrollState` (`@/lib/mesh`, unit-tested there):
    //   0.0-0.3  camera dollies back
    //   0.3-0.7  nodes disperse, links fade out
    //   0.7-1.0  scene fades out, the 2D background canvas fades in
    //
    // Bounding-sphere note: THREE computes each BufferGeometry's bounding
    // sphere lazily, from whatever positions are live on the geometry at its
    // first render. That first render can land at any spread from 1 (mesh
    // mounted mid-scroll, past the entrance's hand-off threshold, so the
    // entrance never runs at all) up to 3 (mesh mounted at the very top of
    // the page, where the entrance's own initial value is live on frame 1) —
    // there is no "frame 1 always runs at spread N" premise to lean on here.
    // That is not a bug: the mesh group is centred on the origin and the
    // camera always looks straight down it, so whichever sphere gets
    // computed from an early frame is never used to cull the group out of
    // the frustum, regardless of which spread produced it.
    // `Object3D.frustumCulled` defaults to `true` and nothing in this file
    // (or elsewhere) sets it `false` for this group, so frustum culling
    // really is on for it, today — it just never matters, because the
    // frozen sphere, wherever it was computed from, always intersects the
    // frustum given the origin-centred/on-axis geometry above. If that
    // geometry assumption ever changes (an off-centre group, or a camera
    // that doesn't always look straight down the group's axis), this note
    // stops being true and the sphere would need recomputing per frame
    // instead.
    const trigger = host.closest("[data-hero]") ?? host;

    const scrollTrigger = ScrollTrigger.create({
      trigger: trigger as Element,
      start: "top top",
      end: "bottom top",
      scrub: GSAP_SCRUB_OPTION,
      onUpdate: (self) => {
        targetProgress = self.progress;
        // A single update can cross the entire hero — a scrollbar drag or a
        // fast flick — and GSAP fires onToggle only when `isActive` flips.
        // `isActive` is false at BOTH progress 0 and progress 1, so a
        // 1 -> 0 or 0 -> 1 traversal in one update toggles nothing. Without
        // restarting here, dragging the scrollbar back to the top left the
        // loop parked with renderedProgress still at 1 and no mesh on screen
        // until some later scroll happened to heal it.
        if (self.progress < 1) start();
      },
      // No `onToggle`. It would be dead code: stopping is now `tick`'s job
      // (see the parking block there), and restarting is already handled
      // above — GSAP fires `onToggle` only from inside the same `update()`
      // call that has already fired `onUpdate` with the same `self`, so it
      // could never observe anything `onUpdate` had not seen first.
    });

    // ScrollTrigger.create() refreshes synchronously, and if the page is
    // already scrolled past the hero when this runs — reload or back-
    // navigation with scroll restoration (which lands before this
    // dynamically-imported chunk mounts), a resize/rotation across the mount
    // breakpoint while scrolled down, or reduced motion toggling off while
    // scrolled down — it fires onUpdate during the call above, which already
    // updated `targetProgress`. But a trigger that happens to already read
    // progress 0 at creation fires no onUpdate at all (nothing changed from
    // its own default), so relying on the callback alone would leave
    // `targetProgress`/`renderedProgress` at their unseeded initial values in
    // that case. Read the trigger's own `.progress` directly instead, so
    // both cases seed from what is actually true rather than an assumed 0.
    targetProgress = scrollTrigger.progress;
    renderedProgress = scrollTrigger.progress;
    if (renderedProgress >= ENTRANCE_HANDOFF_PROGRESS) finishEntrance();
    applyProgress(renderedProgress);
    // Match the render loop's running state to the seeded progress too, not
    // just the CSS variable above: `onToggle` only fires on a *change* of
    // progress/isActive, so a trigger already sitting at progress 1 at
    // creation never calls stop() for us, and one already inside [0, 1)
    // never calls start() for us.
    if (renderedProgress < 1) start();
    else stop();

    function onContextLost(event: Event) {
      event.preventDefault();
      contextLost = true;
      stop();
      renderer.domElement.style.opacity = "0";
      // The scroll rig's onUpdate/onToggle run off ScrollTrigger's own
      // ticker, not our rAF loop — stop() above does not stop them. Without
      // killing the trigger here too, a further scroll would keep updating
      // `targetProgress` and (once anything resumed rendering) could hold
      // --bg-fx-opacity at 0 from scroll position alone while the mesh
      // canvas is (now) invisible: both layers gone at once, exactly what
      // this variable exists to prevent. Kill the trigger and hand the
      // screen back immediately.
      scrollTrigger.kill();
      lastBackgroundOpacity = 1;
      document.documentElement.style.setProperty("--bg-fx-opacity", "1");
    }

    // Re-read the accent when the theme toggles, same trick as BackgroundFX.
    const themeObserver = new MutationObserver(() => {
      const [nr, ng, nb] = parseAccent(
        getComputedStyle(document.documentElement).getPropertyValue("--accent"),
      );
      nodeMaterial.color.setRGB(nr / 255, ng / 255, nb / 255);
      linkMaterial.color.setRGB(nr / 255, ng / 255, nb / 255);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    return () => {
      stop();
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      scrollTrigger.kill();
      document.documentElement.style.setProperty("--bg-fx-opacity", "1");
      nodeGeometry.dispose();
      linkGeometry.dispose();
      nodeMaterial.dispose();
      linkMaterial.dispose();
      // forceContextLoss immediately frees the GL context itself; dispose()
      // alone only frees three's programs/render lists and leaves the context
      // to be reclaimed by (non-deterministic) GC. Every gate flip, Strict
      // Mode double-effect, and Fast Refresh would otherwise allocate another
      // live context, and browsers cap how many a page can hold.
      renderer.forceContextLoss();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [host]);

  return <div ref={setHost} aria-hidden="true" className={className} />;
}
