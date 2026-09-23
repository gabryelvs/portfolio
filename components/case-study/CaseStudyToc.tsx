"use client";
import { useEffect, useState } from "react";
import { CASE_STUDY_OUTLINE, slugify } from "@/lib/work";

const ITEMS = CASE_STUDY_OUTLINE.map((title) => ({ title, id: slugify(title) }));

export function CaseStudyToc() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const { id } of ITEMS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <nav className="toc" aria-label="On this page">
      <p className="mono">On this page</p>
      <ol>
        {ITEMS.map(({ title, id }) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? "true" : undefined}>
              {title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
