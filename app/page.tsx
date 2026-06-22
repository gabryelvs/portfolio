import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Projects } from "@/components/Projects";
import { getShowcaseProjects } from "@/lib/github";

export const revalidate = 86400;

export default async function Home() {
  const projects = await getShowcaseProjects();
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects projects={projects} />
        <Contact />
      </main>
      <footer className="border-t border-black/10 py-8 text-center text-sm text-zinc-500 dark:border-white/10">
        © {new Date().getFullYear()} Gabryel Veríssimo
      </footer>
    </>
  );
}
