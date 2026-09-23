import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { MoreWork } from "@/components/MoreWork";
import { Nav } from "@/components/Nav";
import { getShowcaseProjects } from "@/lib/github";

export const revalidate = 86400;

export default async function Home() {
  const projects = await getShowcaseProjects();
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <MoreWork projects={projects} />
        <About />
        <Contact />
      </main>
      <footer className="border-t border-[var(--border)] py-8 text-center font-[family-name:var(--font-mono)] text-sm text-[var(--fg-muted)]">
        © {new Date().getFullYear()} Gabryel Veríssimo · built with Next.js
      </footer>
    </>
  );
}
