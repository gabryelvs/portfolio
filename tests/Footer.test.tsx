import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/Footer";

describe("Footer", () => {
  it("credits the name and links the source", () => {
    render(<Footer />);
    expect(screen.getByText(/© \d{4} Gabryel Veríssimo/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Source on GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/gabryelvs/portfolio",
    );
  });
});
