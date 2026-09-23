import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Page not found · ${SITE_NAME}`,
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main">
        <div className="wrap">
          <header className="page-head">
            <h1>Page not found</h1>
            <p>
              Try the <Link href="/">homepage</Link> or see <Link href="/work">all work</Link>.
            </p>
          </header>
        </div>
      </main>
      <Footer />
    </>
  );
}
