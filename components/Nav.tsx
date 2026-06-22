import { ThemeToggle } from "@/components/ThemeToggle";

export function Nav() {
  const links = [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="font-black tracking-tight">GV</a>
        <div className="flex items-center gap-5">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hidden text-sm text-zinc-300 hover:text-white sm:inline">
              {l.label}
            </a>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
