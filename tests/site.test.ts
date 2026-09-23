import { describe, expect, it } from "vitest";
import { AVAILABILITY, BUILT_WITH, CONTACT_LEAD, CONTACT_LINE, LINKS, ROLE, SITE_NAME, SITE_URL } from "@/lib/site";

describe("site constants", () => {
  it("uses an https site URL without a trailing slash", () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+$/);
  });

  it("names the person and the role", () => {
    expect(SITE_NAME).toBe("Gabryel Veríssimo");
    expect(ROLE).toBe("Software Engineer");
  });

  it("states availability for graduate and junior roles from summer 2027", () => {
    expect(CONTACT_LINE).toBe(
      "Open to graduate and junior software engineer roles in London from summer 2027.",
    );
    expect(AVAILABILITY).toEqual({
      roles: "Open to graduate & junior roles",
      place: "London",
      when: "from summer 2027",
    });
  });

  it("builds the contact line from the shared lead and availability window", () => {
    expect(CONTACT_LINE).toBe(`${CONTACT_LEAD} ${AVAILABILITY.when}.`);
    expect(CONTACT_LEAD).toBe("Open to graduate and junior software engineer roles in London");
  });

  it("discloses AI-assisted development", () => {
    expect(BUILT_WITH).toMatch(/AI-assisted development \(Claude Code\)/);
  });

  it("links to real destinations", () => {
    expect(LINKS.email).toBe("mailto:gabryelverissimo12@gmail.com");
    expect(LINKS.github).toBe("https://github.com/gabryelvs");
    expect(LINKS.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\/in\//);
    expect(LINKS.cv).toBe("/cv.pdf");
    expect(LINKS.source).toBe("https://github.com/gabryelvs/portfolio");
  });
});
