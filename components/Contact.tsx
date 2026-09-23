import { SectionHeading } from "@/components/SectionHeading";
import { AVAILABILITY, CONTACT_LEAD, LINKS } from "@/lib/site";

export function Contact() {
  return (
    <section className="block" id="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <SectionHeading index="05" id="contact-title" title="Contact" />
        <p className="contact-line">
          {CONTACT_LEAD}{" "}
          <span className="soft">{AVAILABILITY.when}.</span>
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
