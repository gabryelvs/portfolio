import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "@/components/ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("light");
});

describe("ThemeToggle", () => {
  it("toggles light class and persists choice", async () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: /theme/i });
    await userEvent.click(btn);
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("light");
    await userEvent.click(btn);
    expect(document.documentElement.classList.contains("light")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
