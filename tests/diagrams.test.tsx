import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SequenceDiagram, splitLabel } from "@/components/diagrams/SequenceDiagram";
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

  it("narrow variant renders each step's short main label and no lane-to-lane line", () => {
    const { container } = render(<SequenceDiagram seq={seq} />);
    const narrow = container.querySelector("svg.dgm-narrow")!;
    expect(narrow.textContent).not.toMatch(/→/);
    for (const step of seq.steps) {
      const { main } = splitLabel(step.label);
      expect(narrow.textContent).toContain(main);
    }
  });

  it("narrow variant renders a detail line only when the label has one", () => {
    const withDetail = {
      ...seq,
      steps: [
        { kind: "msg" as const, from: "a", to: "b", label: "POST /thing  Idempotency-Key", hot: true },
        { kind: "msg" as const, from: "b", to: "a", label: "no detail here" },
      ],
    };
    const { container } = render(<SequenceDiagram seq={withDetail} />);
    const narrow = container.querySelector("svg.dgm-narrow")!;
    const texts = Array.from(narrow.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("POST /thing");
    expect(texts).toContain("Idempotency-Key");
    expect(texts).toContain("no detail here");
    // exactly one detail line (11px t-muted) was rendered, for the one step that has a detail
    const detailTexts = Array.from(narrow.querySelectorAll("text.t-muted")).filter(
      (t) => t.getAttribute("font-size") === "11",
    );
    expect(detailTexts).toHaveLength(1);
    expect(detailTexts[0].textContent).toBe("Idempotency-Key");
  });
});

describe("splitLabel", () => {
  it("splits on the first two-space separator", () => {
    expect(splitLabel("main label  the detail")).toEqual({ main: "main label", detail: "the detail" });
  });

  it("returns a null detail when there is no two-space separator", () => {
    expect(splitLabel("just one line, no split")).toEqual({ main: "just one line, no split", detail: null });
  });

  it("splits only on the first occurrence of the two-space separator", () => {
    expect(splitLabel("a  b  c")).toEqual({ main: "a", detail: "b  c" });
  });

  it("trims the detail", () => {
    expect(splitLabel("main   detail  ")).toEqual({ main: "main", detail: "detail" });
  });
});

describe("narrow sequence diagram labels fit the phone frame", () => {
  for (const [slug, s] of Object.entries(sequences)) {
    it(`${slug}: every step's narrow main is ≤34 chars and detail is ≤40 chars`, () => {
      for (const step of s.steps) {
        const { main, detail } = splitLabel(step.label);
        expect(main.length).toBeLessThanOrEqual(34);
        if (detail !== null) {
          expect(detail.length).toBeLessThanOrEqual(40);
        }
      }
    });
  }
});
