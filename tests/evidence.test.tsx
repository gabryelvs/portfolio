import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Evidence } from "@/components/case-study/Evidence";

const SHA = "b".repeat(40);

describe("Evidence - breakableIdentifier", () => {
  it("wraps test names with underscores at word boundaries", () => {
    const { container } = render(
      <Evidence
        path="app/services/transfer_service.py"
        lines="28-53"
        repoUrl="https://github.com/test/repo"
        commit={SHA}
      >
        _lock_wallet_unsafe_release
      </Evidence>
    );

    const link = screen.getByRole("link");
    const wbrElements = container.querySelectorAll("a wbr");
    expect(wbrElements.length).toBeGreaterThan(0);
    // Verify accessible name is the original text
    expect(link).toHaveAccessibleName("_lock_wallet_unsafe_release");
  });

  it("wraps camelCase test names at word boundaries", () => {
    const { container } = render(
      <Evidence
        path="src/test/java/PaymentTest.java"
        lines="42-67"
        repoUrl="https://github.com/test/repo"
        commit={SHA}
      >
        reusedRefreshTokenRevokesWholeFamily
      </Evidence>
    );

    const link = screen.getByRole("link");
    const wbrElements = container.querySelectorAll("a wbr");
    // Should have breaks before each uppercase: Reused, Refresh, Token, Revokes, Whole, Family
    expect(wbrElements.length).toBeGreaterThan(0);
    // Verify accessible name is the original text
    expect(link).toHaveAccessibleName("reusedRefreshTokenRevokesWholeFamily");
  });

  it("wraps mixed underscore and camelCase identifiers", () => {
    const { container } = render(
      <Evidence
        path="src/test.py"
        repoUrl="https://github.com/test/repo"
        commit={SHA}
      >
        test_myFunction_subCase
      </Evidence>
    );

    const link = screen.getByRole("link");
    const wbrElements = container.querySelectorAll("a wbr");
    expect(wbrElements.length).toBeGreaterThan(0);
    // Verify accessible name is the original text
    expect(link).toHaveAccessibleName("test_myFunction_subCase");
  });

  it("preserves text with no word boundaries", () => {
    const { container } = render(
      <Evidence
        path="simple.py"
        repoUrl="https://github.com/test/repo"
        commit={SHA}
      >
        simplename
      </Evidence>
    );

    const link = screen.getByRole("link");
    const wbrElements = container.querySelectorAll("a wbr");
    expect(wbrElements.length).toBe(0);
    expect(link).toHaveAccessibleName("simplename");
  });

  it("handles non-string children without breaking", () => {
    render(
      <Evidence
        path="test.py"
        repoUrl="https://github.com/test/repo"
        commit={SHA}
      >
        <span>custom content</span>
      </Evidence>
    );

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link.querySelector("span")).toBeInTheDocument();
  });
});
