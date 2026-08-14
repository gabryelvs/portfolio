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

describe("identity copy", () => {
  it("titles the hero as a software engineer", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/software engineer/i);
  });

  it("does not call the hero a backend engineer", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveTextContent(/backend engineer/i);
  });

  it("describes the about intro as software engineering", () => {
    render(<About />);
    expect(screen.getByText(/software engineering/i)).toBeInTheDocument();
  });

  it("keeps the Backend skills group", () => {
    render(<About />);
    expect(screen.getByRole("heading", { name: "Backend" })).toBeInTheDocument();
  });

  it("offers software engineering roles in contact", () => {
    render(<Contact />);
    expect(screen.getByText(/software engineering roles/i)).toBeInTheDocument();
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
