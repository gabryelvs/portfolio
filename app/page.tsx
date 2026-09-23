import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MoreWork } from "@/components/MoreWork";
import { Nav } from "@/components/Nav";
import { SelectedWork } from "@/components/SelectedWork";
import { getShowcaseProjects } from "@/lib/github";

export const revalidate = 86400;

export default async function Home() {
  const projects = await getShowcaseProjects();
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <SelectedWork />
        <Experience />
        <MoreWork projects={projects} />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
