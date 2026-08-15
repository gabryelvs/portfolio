"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { ScrollTrigger } from "@/lib/gsap";
import {
  clampDpr,
  HERO_LINK_DISTANCE,
  HERO_NODE_COUNT,
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

    // Single source of animated truth. Task 6's scroll rig writes to `spread`,
    // `linkOpacity` and `cameraZ`; the entrance tween writes `spread` too.
    const state = { spread: 3, linkOpacity: 0.28, cameraZ: 14 };
    const ENTRANCE_MS = 1200;
    // Entrance progress is tracked as accumulated animated (rAF delta) time,
    // not wall-clock time. Browsers do not deliver rAF to hidden tabs, so a
    // wall-clock start timestamp captured at setup would already be "expired"
    // by the time a background tab is foregrounded, skipping the fly-in
    // entirely. Accumulating deltas between actual tick() calls means the
    // entrance only progresses while frames are actually being drawn.
    let entranceElapsedMs = 0;
    let lastTickTime: number | null = null;

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

    function tick(now: number) {
      // Entrance: nodes fly in from 3x their home radius over 1.2s of actually
      // animated time, ease-out cubic. Guarded to only write `state.spread`
      // near the top of the page (scrollState.progress < 0.05) so it stops
      // fighting the scroll rig's own `state.spread` writes the moment the
      // user starts scrolling away — otherwise the two would alternate
      // control of the same field frame to frame.
      const dt = lastTickTime === null ? 0 : now - lastTickTime;
      lastTickTime = now;
      if (entranceElapsedMs < ENTRANCE_MS) {
        entranceElapsedMs = Math.min(entranceElapsedMs + dt, ENTRANCE_MS);
        const t = entranceElapsedMs / ENTRANCE_MS;
        const eased = 1 - Math.pow(1 - t, 3);
        if (scrollState.progress < 0.05) state.spread = 3 - 2 * eased;
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

    function onContextLost(event: Event) {
      event.preventDefault();
      contextLost = true;
      stop();
      renderer.domElement.style.opacity = "0";
      // The scroll rig's onUpdate is driven by ScrollTrigger's own ticker, not
      // by our rAF loop — stop() above does not stop it. Without killing it
      // here too, a further scroll would keep calling applyProgress() and
      // writing --bg-fx-opacity from scroll position alone, which can hold it
      // at 0 while the mesh canvas is (now) invisible: both layers gone at
      // once, exactly what this variable exists to prevent. Kill the trigger
      // and hand the screen back immediately.
      scrollTrigger.kill();
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
    start();

    // Scroll choreography, scrubbed against the hero section's own progress.
    //   0.0-0.3  camera dollies back
    //   0.3-0.7  nodes disperse, links fade out
    //   0.7-1.0  scene fades out, the 2D background canvas fades in
    //
    // Bounding-sphere note: THREE computes each BufferGeometry's bounding
    // sphere lazily, from whatever positions are live on the geometry's first
    // render — here, frame 1 of the entrance, where state.spread is still its
    // initial 3 (the entrance's own maximum). The rig below tops out at
    // spread = 1 + 1.8 = 2.8 (its `p` clamps to 1), which stays inside that
    // first-frame sphere, so the mesh is never frustum-culled mid-scroll. If
    // either constant changes, re-check that the new maximum stays below the
    // entrance's maximum spread of 3.
    const trigger = host.closest("[data-hero]") ?? host;
    const scrollState = { progress: 0 };

    function applyProgress(p: number) {
      state.cameraZ = 14 + 6 * p;
      state.spread = 1 + 1.8 * Math.min(Math.max((p - 0.3) / 0.4, 0), 1);
      state.linkOpacity = 0.28 * (1 - Math.min(Math.max((p - 0.3) / 0.4, 0), 1));
      const handoff = Math.min(Math.max((p - 0.7) / 0.3, 0), 1);
      nodeMaterial.opacity = 0.95 * (1 - handoff);
      document.documentElement.style.setProperty("--bg-fx-opacity", String(handoff));
    }

    const scrollTrigger = ScrollTrigger.create({
      trigger: trigger as Element,
      start: "top top",
      end: "bottom top",
      scrub: 0.6,
      onUpdate: (self) => {
        scrollState.progress = self.progress;
        applyProgress(self.progress);
      },
      onToggle: (self) => {
        // Stop burning frames once the hero is off screen.
        if (self.isActive) start();
        else stop();
      },
    });

    applyProgress(0);

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
