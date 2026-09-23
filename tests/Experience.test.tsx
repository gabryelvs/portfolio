import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Experience } from "@/components/Experience";

describe("Experience", () => {
  it("shows the freelance role with Auto Boutique marked pro bono", () => {
    const { container } = render(<Experience />);
    expect(screen.getByRole("heading", { level: 3, name: /Freelance Software Engineer/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Auto Boutique London" })).toHaveAttribute(
      "href",
      "https://autoboutiquelondon.co.uk",
    );
    expect(container).toHaveTextContent(/\(pro bono\)/);
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
