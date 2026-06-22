import { ThemeToggle } from "@/components/ThemeToggle";

export function Nav() {
  const links = [
    { label: "Projects", href: "#projects" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          className="font-[family-name:var(--font-mono)] text-sm font-bold tracking-tight"
        >
          <span className="text-[var(--accent-text)]">gv</span>
          <span className="text-[var(--fg-muted)]">/</span>
          <span>dev</span>
        </a>
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-xs text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] sm:text-sm"
            >
              {l.label}
            </a>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
