import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_NAME } from "@/lib/site";

const LINKS = [
  { label: "Work", href: "/#work", key: "work", optional: false },
  { label: "Experience", href: "/#experience", key: "experience", optional: true },
  { label: "About", href: "/#about", key: "about", optional: true },
  { label: "Contact", href: "/#contact", key: "contact", optional: false },
] as const;

export function Nav({ current }: { current?: "work" }) {
  return (
    <header className="nav">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="wrap">
        <Link className="name" href="/">
          {SITE_NAME}
        </Link>
        <nav aria-label="Primary">
          <ul>
            {LINKS.map((l) => (
              <li key={l.key} className={l.optional ? "opt" : undefined}>
                <a href={l.href} aria-current={current === l.key ? "true" : undefined}>
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
