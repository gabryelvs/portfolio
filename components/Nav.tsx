import { ThemeToggle } from "@/components/ThemeToggle";

export function Nav() {
  const links = [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="font-black tracking-tight">GV</a>
        <div className="flex items-center gap-3 sm:gap-5">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-xs text-zinc-600 hover:text-zinc-900 sm:text-sm dark:text-zinc-300 dark:hover:text-white">
              {l.label}
            </a>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
