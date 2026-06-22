import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "@/components/ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("ThemeToggle", () => {
  it("defaults to dark, toggles on click, and persists choice", async () => {
    render(<ThemeToggle />);
    const btn = await screen.findByRole("button", { name: /theme/i });
    // After mount, dark is the default
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    // First click → light mode
    await userEvent.click(btn);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
    // Second click → dark mode
    await userEvent.click(btn);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
