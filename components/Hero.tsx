"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { shouldRenderMesh } from "@/lib/mesh";

// ssr: false keeps three.js out of the server-rendered HTML and out of the
// initial chunk, so the hero text stays the LCP element. The mount gate below
// means this module is only ever requested once the gate has already passed —
// the `{condition && <Component />}` idiom this Next version's own lazy-loading
// guide shows, rather than gating inside the lazily-imported component itself.
const HeroMesh = dynamic(() => import("@/components/HeroMesh").then((m) => m.HeroMesh), {
  ssr: false,
});

const metrics = [
  { value: "6", label: "shipped projects" },
  { value: "220+", label: "automated tests" },
  { value: "5", label: "live deployments" },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [meshEnabled, setMeshEnabled] = useState(false);

  // The 3D hero mesh mounts only on wide viewports with motion allowed.
  // `shouldRenderMesh` is the single source of that decision (shared with the
  // 2D BackgroundFX fallback's own sizing maths). Evaluated on the client
  // after mount, then re-evaluated on resize and on a live change to the
  // reduced-motion OS setting, so crossing the breakpoint or toggling the
  // setting mounts/unmounts the scene without a reload.
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () =>
      setMeshEnabled(
        shouldRenderMesh({ width: window.innerWidth, reducedMotion: media.matches }),
      );
    evaluate();
    window.addEventListener("resize", evaluate);
    media.addEventListener("change", evaluate);
    return () => {
      window.removeEventListener("resize", evaluate);
      media.removeEventListener("change", evaluate);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-item]",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.08 },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="top"
      data-hero
      className="relative mx-auto flex min-h-[88svh] max-w-5xl flex-col justify-center px-6 py-20"
    >
      {meshEnabled && <HeroMesh className="pointer-events-none absolute inset-0 -z-10" />}

      <p
        data-hero-item
        className="mb-6 font-[family-name:var(--font-mono)] text-sm text-[var(--fg-muted)]"
      >
        <span className="text-[var(--ok)]">~/gabryel</span>{" "}
        <span className="text-[var(--accent-text)]">$</span> whoami
      </p>

      <h1
        data-hero-item
        className="font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl"
      >
        Software engineer who ships{" "}
        <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--highlight)] bg-clip-text text-transparent">
          reliable systems
        </span>
        .
      </h1>

      <p
        data-hero-item
        className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--fg-muted)]"
      >
        Computer Science student building production-grade APIs in Python (FastAPI) and
        Java (Spring Boot) — payments, ledgers, async services, and reliable delivery —
        plus fullstack tools with React and TypeScript.
      </p>

      <div data-hero-item className="mt-10 flex flex-wrap gap-3">
        <a
          href="#projects"
          className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--accent-contrast)] transition-colors hover:opacity-90"
        >
          View projects
        </a>
        <a
          href="/cv.pdf"
          className="rounded-lg border border-[var(--border-strong)] px-6 py-3 font-semibold transition-colors hover:bg-[var(--surface)]"
        >
          Download CV
        </a>
      </div>

      <dl
        data-hero-item
        className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-[var(--border)] pt-8"
      >
        {metrics.map((m) => (
          <div key={m.label}>
            <dt className="tnum font-[family-name:var(--font-mono)] text-3xl font-bold text-[var(--accent-text)]">
              {m.value}
            </dt>
            <dd className="mt-1 text-sm text-[var(--fg-muted)]">{m.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
