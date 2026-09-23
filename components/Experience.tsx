import { SectionHeading } from "@/components/SectionHeading";

export function Experience() {
  return (
    <section className="block" id="experience" aria-labelledby="exp-title">
      <div className="wrap">
        <SectionHeading index="02" id="exp-title" title="Experience" sub="Client work and education." />
        <div className="rows">
          <div className="row reveal">
            <div className="when mono">Sep 2026 – now</div>
            <div>
              <h3>
                Freelance Software Engineer <span className="org">· Self-employed, London</span>
              </h3>
              <p>
                <a href="https://autoboutiquelondon.co.uk">Auto Boutique London</a> (pro bono):
                designed, built and deployed the production site for a Central London car-storage
                business, replacing a WordPress install with a static Astro build, a PHP enquiry
                endpoint sending mail through Resend, and push-to-deploy from GitHub Actions.
              </p>
            </div>
          </div>
          <div className="row reveal">
            <div className="when mono">2023 – Jul 2027</div>
            <div>
              <h3>
                BSc Computer Science <span className="org">· University of Greenwich</span>
              </h3>
              <p>Final year, following a foundation year. Expected to graduate July 2027.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
