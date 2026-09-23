import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SelectedWork } from "@/components/SelectedWork";

describe("SelectedWork", () => {
  it("is the numbered Selected work section", () => {
    render(<SelectedWork />);
    expect(screen.getByRole("heading", { level: 2, name: "Selected work" })).toBeInTheDocument();
    expect(document.getElementById("work")).not.toBeNull();
  });

  it("lists the three case studies in order, each linking to its page", () => {
    render(<SelectedWork />);
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles[0]).toMatch(/^PayLedger/);
    expect(titles[1]).toMatch(/^Webhook Inspector/);
    expect(titles[2]).toMatch(/^Taskboard API/);
    expect(screen.getByRole("link", { name: "PayLedger" })).toHaveAttribute("href", "/work/payledger");
    expect(screen.getByRole("link", { name: /Read the case study about Taskboard API/ })).toHaveAttribute(
      "href",
      "/work/taskboard-api",
    );
  });

  it("shows countable facts and a live marker for deployed projects", () => {
    render(<SelectedWork />);
    const first = screen.getAllByRole("article")[0];
    expect(within(first).getByText("SELECT … FOR UPDATE, locked in id order")).toBeInTheDocument();
    expect(within(first).getByText("Live demo")).toBeInTheDocument();
    expect(within(first).getByRole("img", { name: "PayLedger transfer path" })).toBeInTheDocument();
  });
});
