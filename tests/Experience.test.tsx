import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Experience } from "@/components/Experience";

describe("Experience", () => {
  it("shows the finished AP Homes internship with the Auto Boutique build", () => {
    const { container } = render(<Experience />);
    expect(
      screen.getByRole("heading", { level: 3, name: /Software Engineering Intern · AP Homes Ltd/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Auto Boutique London" })).toHaveAttribute(
      "href",
      "https://autoboutiquelondon.co.uk",
    );
    expect(container).toHaveTextContent(/Sep 2026 – Oct 2026/);
    expect(container).not.toHaveTextContent(/– now|Freelance|pro bono/i);
  });

  it("lists the Greenwich Consultancy Sprint first, in the present tense", () => {
    const { container } = render(<Experience />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[0]).toHaveTextContent(
      "Greenwich Internship – Consultancy Sprint · University of Greenwich",
    );
    expect(container).toHaveTextContent(/Oct 2026 – Nov 2026/);
    expect(container).toHaveTextContent(
      "Working in a six-person team on a live brief from an external organisation assigned by the University",
    );
  });

  it("shows the degree with its expected graduation", () => {
    const { container } = render(<Experience />);
    expect(screen.getByRole("heading", { level: 3, name: /BSc Computer Science/ })).toBeInTheDocument();
    expect(container).toHaveTextContent(/July 2027/);
  });

  it("keeps non-engineering roles on the CV only", () => {
    const { container } = render(<Experience />);
    expect(container).not.toHaveTextContent(/Ivy|Runner|Youth Leader|Cathedral/i);
  });
});
