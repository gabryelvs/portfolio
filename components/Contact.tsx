const links = [
  { label: "Email", href: "mailto:gabryelverissimo12@gmail.com" },
  { label: "GitHub", href: "https://github.com/gabryelvs" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/gabryel-ver%C3%ADssimo-b1b931261" },
  { label: "Download CV", href: "/cv.pdf" },
];

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h2 className="mb-6 text-3xl font-black tracking-tight sm:text-4xl">Get in touch</h2>
      <p className="mb-8 text-zinc-400">
        Open to junior / placement backend roles in London. Let&apos;s talk.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="rounded-lg border border-white/15 px-5 py-2.5 font-medium hover:border-violet-400/60 hover:bg-white/10"
          >
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}
