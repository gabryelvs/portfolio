import { SectionHeading } from "@/components/SectionHeading";
import { LINKS } from "@/lib/site";

export function Contact() {
  return (
    <section className="block" id="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <SectionHeading index="05" id="contact-title" title="Contact" />
        <p className="contact-line">
          Open to graduate and junior software engineer roles in London{" "}
          <span className="soft">from summer 2027.</span>
        </p>
        <a className="mail" href={LINKS.email}>
          {LINKS.emailLabel}
        </a>
        <div className="contact-links">
          <a className="btn btn-line" href={LINKS.github}>GitHub</a>
          <a className="btn btn-line" href={LINKS.linkedin}>LinkedIn</a>
          <a className="btn btn-line" href={LINKS.cv}>Download CV</a>
        </div>
      </div>
    </section>
  );
}
