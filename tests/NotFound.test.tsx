import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound, { metadata } from "@/app/not-found";

describe("app/not-found", () => {
  it("renders exactly one h1 announcing the page is not found", () => {
    render(<NotFound />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Page not found");
  });

  it("links back to home and to all work", () => {
    const { container } = render(<NotFound />);
    expect(container.querySelector('a[href="/"]')).not.toBeNull();
    expect(container.querySelector('a[href="/work"]')).not.toBeNull();
  });

  it("keeps the site chrome: primary nav and footer", () => {
    render(<NotFound />);
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("titles the page 'Page not found · Gabryel Veríssimo'", () => {
    expect(metadata.title).toBe("Page not found · Gabryel Veríssimo");
  });
});
