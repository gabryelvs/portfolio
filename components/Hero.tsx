"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section id="top" className="mx-auto flex min-h-[80vh] max-w-5xl flex-col justify-center px-6">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-violet-700 dark:text-violet-300"
      >
        Hi, I&apos;m Gabryel —
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-5xl font-black leading-tight tracking-tighter sm:text-7xl"
      >
        Backend engineer who ships{" "}
        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          reliable systems
        </span>
        .
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300"
      >
        Computer Science student building production-grade APIs in Python &amp; FastAPI —
        payments, async services, and reliable delivery.
      </motion.p>
      <div className="mt-10 flex gap-4">
        <a href="#projects" className="rounded-lg bg-violet-500 px-6 py-3 font-semibold text-white hover:bg-violet-400">
          View projects
        </a>
        <a href="/cv.pdf" className="rounded-lg border border-black/15 px-6 py-3 font-semibold hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">
          Download CV
        </a>
      </div>
    </section>
  );
}
