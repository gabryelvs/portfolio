"use client";

import { motion } from "framer-motion";

const metrics = [
  { value: "3", label: "production APIs" },
  { value: "90+", label: "automated tests" },
  { value: "2", label: "live deployments" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section
      id="top"
      className="mx-auto flex min-h-[88svh] max-w-5xl flex-col justify-center px-6 py-20"
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="mb-6 font-[family-name:var(--font-mono)] text-sm text-[var(--fg-muted)]"
      >
        <span className="text-[var(--ok)]">~/gabryel</span>{" "}
        <span className="text-[var(--accent-text)]">$</span> whoami
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.5, ease }}
        className="font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl"
      >
        Backend engineer who ships{" "}
        <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--highlight)] bg-clip-text text-transparent">
          reliable systems
        </span>
        .
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.5, ease }}
        className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--fg-muted)]"
      >
        Computer Science student building production-grade APIs in Python &amp; FastAPI —
        payments, ledgers, async services, and reliable delivery.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.5, ease }}
        className="mt-10 flex flex-wrap gap-3"
      >
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
      </motion.div>

      <motion.dl
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.5, ease }}
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
      </motion.dl>
    </section>
  );
}
