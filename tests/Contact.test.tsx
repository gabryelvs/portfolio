import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Contact } from "@/components/Contact";

describe("Contact", () => {
  it("states availability", () => {
    const { container } = render(<Contact />);
    expect(container).toHaveTextContent(
      "Open to graduate and junior software engineer roles in London from summer 2027.",
    );
  });

  it("links email, GitHub, LinkedIn and the CV", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: "hello@gabryelverissimo.dev" })).toHaveAttribute(
      "href",
      "mailto:hello@gabryelverissimo.dev",
    );
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/gabryelvs");
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", expect.stringContaining("linkedin.com"));
    expect(screen.getByRole("link", { name: "Download CV" })).toHaveAttribute("href", "/cv.pdf");
  });
});
