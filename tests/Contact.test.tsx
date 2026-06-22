import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Contact } from "@/components/Contact";

describe("Contact", () => {
  it("renders email, github, linkedin, and CV links", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute(
      "href",
      "mailto:gabryelverissimo12@gmail.com",
    );
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/gabryelvs",
    );
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute("href", expect.stringContaining("linkedin.com"));
    expect(screen.getByRole("link", { name: /cv/i })).toHaveAttribute("href", "/cv.pdf");
  });
});
