"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/gsap";
import {
  clampDpr,
  HERO_LINK_DISTANCE,
  HERO_NODE_COUNT,
  linkPairs,
  parseAccent,
  shouldRenderMesh,
  type Point,
} from "@/lib/mesh";

/** A 3D evolution of the site's service-mesh motif: nodes on a rough spherical
 *  shell, linked where they are close. Desktop-only, motion-allowed-only; the 2D
 *  BackgroundFX canvas is the fallback everywhere else. */
export function HeroMesh({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  // Gate is evaluated on the client and re-evaluated on resize, so rotating a
  // tablet across the breakpoint mounts or unmounts the scene.
  useEffect(() => {
    const evaluate = () =>
      setEnabled(
        shouldRenderMesh({
          width: window.innerWidth,
          reducedMotion: prefersReducedMotion(),
        }),
      );
    evaluate();
    window.addEventListener("resize", evaluate);
    return () => window.removeEventListener("resize", evaluate);
  }, []);

  useEffect(() => {
    if (!enabled || !host) return;

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
    renderer.setSize(host.clientWidth, host.clientHeight, false);
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
    const entranceStart = performance.now();
    const ENTRANCE_MS = 1200;

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

    function tick(now: number) {
      // Entrance: nodes fly in from 3x their home radius over 1.2s, ease-out cubic.
      const t = Math.min((now - entranceStart) / ENTRANCE_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      if (t < 1) state.spread = 3 - 2 * eased;

      group.rotation.y += 0.0008;
      camera.position.z = state.cameraZ;
      linkMaterial.opacity = state.linkOpacity;
      writePositions();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
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
      renderer.setSize(host!.clientWidth, host!.clientHeight, false);
      camera.aspect = host!.clientWidth / Math.max(host!.clientHeight, 1);
      camera.updateProjectionMatrix();
    }

    function onContextLost(event: Event) {
      event.preventDefault();
      stop();
      renderer.domElement.style.opacity = "0";
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

    return () => {
      stop();
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      nodeGeometry.dispose();
      linkGeometry.dispose();
      nodeMaterial.dispose();
      linkMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [enabled, host]);

  if (!enabled) return null;
  return <div ref={setHost} aria-hidden="true" className={className} />;
}
