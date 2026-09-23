import { LINKS, SITE_NAME } from "@/lib/site";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <span>
          © {new Date().getFullYear()} {SITE_NAME}
        </span>
        <a href={LINKS.source}>Source on GitHub</a>
      </div>
    </footer>
  );
}
