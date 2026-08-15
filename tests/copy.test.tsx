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
