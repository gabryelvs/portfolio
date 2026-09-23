import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Evidence } from "@/components/case-study/Evidence";

describe("Evidence with breakableAtUnderscores", () => {
  it("renders test names with accessible name matching the original text", () => {
    render(
      <Evidence
        path="src/test.ts"
        repoUrl="https://github.com/example/repo"
        commit="abc123"
      >
        test_no_lost_updates_under_concurrency
      </Evidence>
    );
    const link = screen.getByRole("link", { name: "test_no_lost_updates_under_concurrency" });
    expect(link).toBeInTheDocument();
  });

  it("inserts wbr elements after underscores for better wrapping", () => {
    render(
      <Evidence
        path="src/test.ts"
        repoUrl="https://github.com/example/repo"
        commit="abc123"
      >
        test_no_lost_updates_under_concurrency
      </Evidence>
    );
    const link = screen.getByRole("link", { name: "test_no_lost_updates_under_concurrency" });
    const wbrElements = link.querySelectorAll("wbr");
    expect(wbrElements.length).toBeGreaterThan(0);
  });

  it("does not add wbr elements for non-string children", () => {
    render(
      <Evidence
        path="src/test.ts"
        repoUrl="https://github.com/example/repo"
        commit="abc123"
      >
        <span>test_name</span>
      </Evidence>
    );
    const link = screen.getByRole("link");
    const wbrElements = link.querySelectorAll("wbr");
    expect(wbrElements.length).toBe(0);
  });
});
