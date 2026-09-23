import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import cv from "../cv/cv-data.json";

// This file only asserts on text content, at whatever viewport/motion
// settings jsdom happens to default to (no stub here sets either). Those
// defaults put the WebGL hero mesh's gate in the *open* position (jsdom's
// default innerWidth is 1024, and the default matchMedia stub reports
// `matches: false`), so without this mock, Hero would mount the real
// HeroMesh and reach `THREE.WebGLRenderer` construction under jsdom as an
// incidental side effect of a test that has nothing to do with the mesh.
// Stubbing the module keeps this file honest about what it actually checks.
vi.mock("@/components/HeroMesh", () => ({
  HeroMesh: () => null,
}));

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
    expect(screen.getByRole("heading", { name: "Backend" })).toBeInTheDocument();
  });

  it("offers graduate and junior roles from summer 2027 in contact", () => {
    render(<Contact />);
    expect(
      screen.getByText(/graduate and junior software engineer roles in London from summer 2027/i),
    ).toBeInTheDocument();
  });

  it("titles the page metadata as Software Engineer", () => {
    expect(layoutSource).toContain('title: "Gabryel Veríssimo — Software Engineer"');
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

describe("freelance experience", () => {
  const freelance = cv.experience[0];

  it("leads the CV experience with the freelance role", () => {
    expect(freelance.role).toBe("Freelance Software Engineer");
  });

  it("labels the unpaid Auto Boutique build as pro bono", () => {
    const bullet = freelance.bullets.find((b) => b.includes("Auto Boutique"));
    expect(bullet).toMatch(/pro bono/i);
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
