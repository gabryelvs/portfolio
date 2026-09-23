import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SequenceDiagram } from "@/components/diagrams/SequenceDiagram";
import { WorkThumb } from "@/components/diagrams/WorkThumb";
import { sequences } from "@/lib/sequences";
import { caseStudies } from "@/lib/work";

describe("WorkThumb", () => {
  it.each(caseStudies.map((c) => [c.slug] as const))("%s renders a labelled image with a drawable hot path", (slug) => {
    const { container } = render(<WorkThumb slug={slug} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAccessibleName();
    expect(img).toHaveAccessibleDescription();
    expect(container.querySelector("path.hot-draw[pathLength='1']")).not.toBeNull();
  });
});

describe("SequenceDiagram", () => {
  const seq = {
    id: "t",
    title: "Test flow",
    desc: "A test flow.",
    caption: "Caption.",
    lanes: [{ id: "a", label: "a" }, { id: "b", label: "b" }],
    steps: [
      { kind: "msg" as const, from: "a", to: "b", label: "hello", hot: true },
      { kind: "note" as const, at: "b", label: "think" },
      { kind: "msg" as const, from: "b", to: "a", label: "reply" },
    ],
  };

  it("renders a wide and a narrow variant, both labelled", () => {
    render(<SequenceDiagram seq={seq} />);
    const imgs = screen.getAllByRole("img", { name: "Test flow" });
    expect(imgs).toHaveLength(2);
    imgs.forEach((img) => expect(img).toHaveAccessibleDescription("A test flow."));
  });

  it("draws one arrow per message and marks hot steps", () => {
    const { container } = render(<SequenceDiagram seq={seq} />);
    const wide = container.querySelector("svg.dgm-wide")!;
    expect(wide.querySelectorAll("path.msg")).toHaveLength(2);
    expect(wide.querySelectorAll("path.msg.hot")).toHaveLength(1);
    expect(wide.querySelectorAll("rect.node-strong")).toHaveLength(1);
  });

  it("shows the caption", () => {
    render(<SequenceDiagram seq={seq} />);
    expect(screen.getByText("Caption.")).toBeInTheDocument();
  });

  it("has a sequence for every case study, referencing only its own lanes", () => {
    for (const c of caseStudies) {
      const s = sequences[c.slug];
      const lanes = new Set(s.lanes.map((l) => l.id));
      for (const step of s.steps) {
        if (step.kind === "msg") {
          expect(lanes.has(step.from) && lanes.has(step.to)).toBe(true);
        } else {
          expect(lanes.has(step.at)).toBe(true);
        }
      }
    }
  });
});
