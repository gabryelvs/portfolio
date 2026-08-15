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

    // Smoothing time constant (seconds) for the scroll rig, shared with the
    // `scrub` option passed to ScrollTrigger.create below so the two can't
    // silently diverge. GSAP's own `scrub` tween only exists when a
    // ScrollTrigger has an `animation` attached — this one has none, so
    // passing `scrub` alone does not smooth anything by itself; the actual
    // smoothing happens in `tick`, which eases `renderedProgress` toward
    // `targetProgress` every frame using this same constant.
    const SCRUB_SECONDS = 0.6;
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
      // the target with time constant SCRUB_SECONDS).
      const remaining = targetProgress - renderedProgress;
      if (remaining !== 0) {
        const ease = dt > 0 ? 1 - Math.exp(-dt / (SCRUB_SECONDS * 1000)) : 1;
        renderedProgress += remaining * ease;
        if (Math.abs(targetProgress - renderedProgress) < PROGRESS_SNAP_EPSILON) {
          renderedProgress = targetProgress;
        }
      }

      // Entrance-to-rig handoff: one-way. The instant the eased progress
      // reaches the threshold, the entrance is retired for good (see
      // `entranceFinished`'s own comment) rather than merely skipped for
      // this frame.
      if (!entranceFinished && renderedProgress >= ENTRANCE_HANDOFF_PROGRESS) {
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
      }

      group.rotation.y += 0.0008;
      camera.position.z = state.cameraZ;
      linkMaterial.opacity = state.linkOpacity;
      writePositions();
      renderer.render(scene, camera);
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
      if (document.hidden) stop();
      else start();
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
    // the frustum, regardless of which spread produced it. If frustum
    // culling is ever turned on for this group specifically (it is not,
    // today), this note stops being true and the sphere would need
    // recomputing per frame instead.
    const trigger = host.closest("[data-hero]") ?? host;

    const scrollTrigger = ScrollTrigger.create({
      trigger: trigger as Element,
      start: "top top",
      end: "bottom top",
      scrub: SCRUB_SECONDS,
      onUpdate: (self) => {
        targetProgress = self.progress;
      },
      onToggle: (self) => {
        // ScrollTrigger's `isActive` is `!!clipped && clipped < 1`, which
        // reads false at progress 0 as well as progress 1 — gating on
        // `isActive` alone would stop the loop the instant the user scrolls
        // back to the very top of the page, freezing the mesh mid-screen,
        // centre-stage. Gate on progress instead: only stop once the hero is
        // genuinely scrolled past.
        if (self.progress < 1) {
          start();
          return;
        }
        // About to stop the loop that does the scrub easing above — force
        // this last frame to land exactly on the endpoint first, or the
        // derived state (in particular --bg-fx-opacity) would freeze
        // wherever the easing happened to be on the frame before the loop
        // stopped, short of the real endpoint.
        targetProgress = 1;
        renderedProgress = 1;
        if (!entranceFinished) finishEntrance();
        applyProgress(1);
        stop();
      },
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
