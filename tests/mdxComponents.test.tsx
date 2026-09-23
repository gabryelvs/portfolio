import { render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef, ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { useMDXComponents } from "@/mdx-components";

describe("useMDXComponents", () => {
  it("makes pre blocks focusable so keyboard users can scroll wide code", () => {
    // The MDX types allow `pre` to be a component or a bare tag name string; this project always
    // supplies a component, so narrow to that for the test.
    const Pre = useMDXComponents({}).pre as ComponentType<ComponentPropsWithoutRef<"pre">> | undefined;
    if (!Pre) throw new Error("useMDXComponents did not map `pre`");
    render(
      <Pre data-testid="block">
        <code>const width = 120;</code>
      </Pre>,
    );
    const pre = screen.getByTestId("block");
    expect(pre.tagName).toBe("PRE");
    expect(pre).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("const width = 120;")).toBeInTheDocument();
  });
});
