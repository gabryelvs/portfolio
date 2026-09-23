import type { CSSProperties } from "react";
import { AVAILABILITY, LINKS, ROLE, SITE_NAME } from "@/lib/site";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap">
        <h1 id="hero-title">
          <span data-in style={step(0)}>
            {SITE_NAME}
          </span>{" "}
          <span className="role" data-in style={step(1)}>
            {ROLE}
          </span>
        </h1>
        <p className="lede" data-in style={step(2)}>
          I build reliable systems for fintech: payments, ledgers and the services around them, in
          Python, Java and TypeScript. Every project here is tested, deployed and open to read.
        </p>
        <p className="avail mono" data-in style={step(3)}>
          <b>{AVAILABILITY.roles}</b> · {AVAILABILITY.place} · {AVAILABILITY.when}
        </p>
        <div className="actions" data-in style={step(4)}>
          <a className="btn btn-solid" href="#work">
            Selected work
          </a>
          <a className="btn btn-line" href={LINKS.cv}>
            Download CV
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
