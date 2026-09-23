import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Claim } from "@/components/case-study/Claim";
import { Evidence } from "@/components/case-study/Evidence";
import { H2, textOf } from "@/components/case-study/Heading";

const SHA = "b".repeat(40);

describe("case-study parts", () => {
  it("links evidence to a pinned file and line range", () => {
    render(
      <Evidence path="app/services/transfer_service.py" lines="28-53" repoUrl="https://github.com/gabryelvs/payledger" commit={SHA}>
        _lock_wallet() and the sorted lock order
      </Evidence>,
    );
    expect(screen.getByText("transfer_service.py")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "_lock_wallet() and the sorted lock order" })).toHaveAttribute(
      "href",
      `https://github.com/gabryelvs/payledger/blob/${SHA}/app/services/transfer_service.py#L28-L53`,
    );
    expect(screen.getByRole("complementary")).toHaveClass("note");
  });

  it("wraps a claim and its evidence in one pair", () => {
    const { container } = render(
      <Claim>
        <p>Body</p>
      </Claim>,
    );
    expect(container.firstElementChild).toHaveClass("pair");
  });

  it("gives h2 headings a stable id from their text", () => {
    render(<H2>What I&apos;d change</H2>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", "what-id-change");
  });

  it("extracts text from nested nodes", () => {
    expect(textOf(<>How it&apos;s <em>tested</em></>)).toBe("How it's tested");
  });
});
