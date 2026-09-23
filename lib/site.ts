/** Site-wide facts. The single source for metadata, UI copy and links. */

export const SITE_URL = "https://gabryelverissimo.dev";

export const SITE_NAME = "Gabryel Verissimo";
export const ROLE = "Software Engineer";

export const AVAILABILITY = {
  roles: "Open to graduate & junior roles",
  place: "London",
  when: "from summer 2027",
} as const;

export const CONTACT_LEAD = "Open to graduate and junior software engineer roles in London";

export const CONTACT_LINE = `${CONTACT_LEAD} ${AVAILABILITY.when}.`;

export const BUILT_WITH =
  "AI-assisted development (Claude Code). I set the design and direction, reviewed each change, and verified it with the tests below.";

export const LINKS = {
  email: "mailto:hello@gabryelverissimo.dev",
  emailLabel: "hello@gabryelverissimo.dev",
  github: "https://github.com/gabryelvs",
  linkedin: "https://www.linkedin.com/in/gabryel-ver%C3%ADssimo-b1b931261",
  cv: "/cv.pdf",
  source: "https://github.com/gabryelvs/portfolio",
} as const;
