const links = [
  { label: "Email", href: "mailto:gabryelverissimo12@gmail.com" },
  { label: "GitHub", href: "https://github.com/gabryelvs" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/gabryel-ver%C3%ADssimo-b1b931261" },
  { label: "Download CV", href: "/cv.pdf" },
];

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-3xl px-6 py-24 text-center">
      <span className="font-[family-name:var(--font-mono)] text-sm text-[var(--accent-text)]">
        03 /
      </span>
      <h2 className="mb-6 mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
        Get in touch
      </h2>
      <p className="mb-8 text-[var(--fg-muted)]">
        Open to junior / placement backend roles in London. Let&apos;s talk.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="rounded-lg border border-[var(--border-strong)] px-5 py-2.5 font-medium transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface)]"
          >
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}
