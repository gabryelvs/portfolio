"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";

/** Fades and rises its children once, when they scroll into view.
 *  Renders children unconditionally — content never depends on animation running. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    }, el);

    // revert() kills the tween and its ScrollTrigger and restores inline styles,
    // so an unmount mid-animation cannot leave content stuck at opacity 0.
    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
