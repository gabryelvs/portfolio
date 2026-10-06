import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import cv from "../cv/cv-data.json";

// Use Node's URL explicitly: under the jsdom test environment the global `URL`
// resolves a relative path against jsdom's document URL (http://localhost:3000)
// instead of the file:// base, which breaks readFileSync.
const layoutSource = readFileSync(new NodeURL("../app/layout.tsx", import.meta.url), "utf8");
const linkedin = readFileSync(new NodeURL("../cv/LINKEDIN-content.md", import.meta.url), "utf8");
const coverLetter = readFileSync(
  new NodeURL("../cv/Cover-Letter-General-Template.md", import.meta.url),
  "utf8",
);

// The identity is "Software Engineer". The degree still appears, but only as
// dated education ("expected Jul 2027"), never as the headline identity, and
// placement roles are no longer targeted.
const STUDENT_FRAMING = /\bstudents?\b|placement|aspiring|final[- ]year/i;

// The fenced block that follows a markdown heading, e.g. the About text.
function fencedBlockAfter(markdown: string, heading: string): string {
  const section = markdown.split(heading)[1] ?? "";
  return (section.split("```")[1] ?? "").replace(/^\n|\n$/g, "");
}

describe("identity copy", () => {
  it("titles the hero as a software engineer", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/software engineer/i);
  });

  it("does not call the hero a backend engineer", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveTextContent(/backend engineer/i);
  });

  it("introduces the about section as a software engineer", () => {
    render(<About />);
    expect(screen.getByText(/software engineer/i)).toBeInTheDocument();
  });

  it("keeps the Backend skills group", () => {
    render(<About />);
    expect(screen.getByText("Backend", { selector: "dt" })).toBeInTheDocument();
  });

  it("offers graduate and junior roles from summer 2027 in contact", () => {
    const { container } = render(<Contact />);
    expect(container).toHaveTextContent(
      /graduate and junior software engineer roles in London from summer 2027/i,
    );
  });

  it("titles the page metadata as Software Engineer", () => {
    expect(layoutSource).toContain('title: "Gabryel Verissimo — Software Engineer"');
    expect(layoutSource).not.toMatch(/backend/i);
  });

  it("headlines the CV as Software Engineer", () => {
    expect(cv.headline).toMatch(/^Software Engineer/);
    expect(cv.headline).not.toMatch(/backend/i);
    expect(cv.profile).not.toMatch(/backend/i);
  });
});

describe("no student framing", () => {
  it.each([
    ["Hero", Hero],
    ["About", About],
    ["Contact", Contact],
  ])("keeps %s free of student framing", (_name, Component) => {
    const { container } = render(<Component />);
    expect(container.textContent).not.toMatch(STUDENT_FRAMING);
  });

  it("keeps the page metadata free of student framing", () => {
    expect(layoutSource).not.toMatch(STUDENT_FRAMING);
  });

  it("keeps the CV headline and profile free of student framing", () => {
    expect(cv.headline).not.toMatch(STUDENT_FRAMING);
    expect(cv.profile).not.toMatch(STUDENT_FRAMING);
  });

  it("dates the degree with its expected graduation", () => {
    const degree = cv.education.find((e) => "primary" in e && e.primary);
    expect(degree?.period).toMatch(/expected Jul 2027/);
  });

  it("keeps the LinkedIn copy and cover letter free of student framing", () => {
    expect(linkedin).not.toMatch(STUDENT_FRAMING);
    expect(coverLetter).not.toMatch(STUDENT_FRAMING);
  });
});

describe("Consultancy Sprint", () => {
  const sprint = cv.experience[0];

  it("leads the CV experience with the Greenwich Consultancy Sprint", () => {
    expect(sprint.role).toBe("Greenwich Internship – Consultancy Sprint");
    expect(sprint.org).toBe("University of Greenwich");
    expect(sprint.period).toBe("Oct 2026 – Nov 2026");
  });

  // Gabryel approved this wording on 2026-10-06. It stays in the present tense
  // while the sprint runs (12 Oct – 15 Nov) and leaves out the module and the
  // pass/fail assessment.
  it("uses the approved present-tense description", () => {
    expect(sprint.bullets).toEqual([
      "Working in a six-person team on a live brief from an external organisation assigned by the University: researching the client's challenge, analysing findings and developing evidence-based recommendations for a consultancy-style report, with feedback from the client.",
    ]);
    expect(sprint.bullets.join(" ")).not.toMatch(/module|pass\/fail|credits?/i);
  });
});

describe("AP Homes internship", () => {
  const internship = cv.experience.find((e) => e.org === "AP Homes Ltd")!;

  it("shows the finished AP Homes internship", () => {
    expect(internship.role).toBe("Software Engineering Intern");
    expect(internship.org).toBe("AP Homes Ltd");
    expect(internship.period).toBe("Sep 2026 – Oct 2026");
  });

  // The site was built during the internship, so it is finished work: "built
  // and deployed", never "maintain", and no longer labelled pro bono.
  it("describes the Auto Boutique build as finished internship work", () => {
    const bullet = internship.bullets.find((b) => b.includes("Auto Boutique"));
    expect(bullet).toMatch(/built and deployed/);
    expect(bullet).not.toMatch(/pro bono|maintain/i);
  });
});

describe("LinkedIn limits", () => {
  it("fits the headline in 220 characters", () => {
    expect(fencedBlockAfter(linkedin, "## 1. Headline").length).toBeLessThanOrEqual(220);
  });

  it("fits the About section in 2,600 characters", () => {
    expect(fencedBlockAfter(linkedin, "## 2. About section").length).toBeLessThanOrEqual(2600);
  });
});
