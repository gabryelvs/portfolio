"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number };

/** Animated "service-mesh" network: drifting nodes linked by thin accent lines.
 *  Sits behind all content (pointer-events-none). Honors prefers-reduced-motion
 *  (renders a single static frame, no animation loop). Uses only canvas paints. */
export function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const context = el.getContext("2d");
    if (!context) return;
    // non-null aliases so TS keeps the narrowing inside the nested closures
    const cv = el;
    const ctx = context;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let raf = 0;

    // Read the indigo accent from the theme tokens and return its RGB triplet.
    function accentRGB(): [number, number, number] {
      const hex = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
      const m = /^#?([0-9a-f]{6})$/i.exec(hex);
      if (!m) return [99, 102, 241]; // indigo-500 fallback
      const n = parseInt(m[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    let [r, g, b] = accentRGB();

    const LINK_DIST = 155;

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = cv.clientWidth;
      height = cv.clientHeight;
      cv.width = Math.floor(width * dpr);
      cv.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(90, Math.max(30, Math.floor((width * height) / 16000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        // links
        for (let j = i + 1; j < nodes.length; j++) {
          const c = nodes[j];
          const dx = a.x - c.x;
          const dy = a.y - c.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.4;
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(c.x, c.y);
            ctx.stroke();
          }
        }
        // node: soft halo + bright core
        ctx.fillStyle = `rgba(${r},${g},${b},0.12)`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step() {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      draw();
      raf = requestAnimationFrame(step);
    }

    function onResize() {
      build();
      draw();
    }

    build();
    draw();
    if (!reduced) raf = requestAnimationFrame(step);

    window.addEventListener("resize", onResize);
    // re-read accent colour when the theme toggles (.dark on <html>)
    const observer = new MutationObserver(() => {
      [r, g, b] = accentRGB();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
