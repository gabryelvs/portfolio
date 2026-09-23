import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/content", () => ({
  // eslint-disable-next-line react/display-name -- inline mock component, not app UI
  loadCaseStudyBody: vi.fn(async () => () => <h2 id="the-problem">The problem</h2>),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import CaseStudyPage, { dynamicParams, generateMetadata, generateStaticParams } from "@/app/work/[slug]/page";
import WorkIndex from "@/app/work/page";

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("/work/[slug]", () => {
  it("statically generates exactly the three case studies", () => {
    expect(generateStaticParams()).toEqual([
      { slug: "payledger" },
      { slug: "webhook-inspector" },
      { slug: "taskboard-api" },
    ]);
    expect(dynamicParams).toBe(false);
  });

  it("builds metadata from the registry", async () => {
    const meta = await generateMetadata(params("payledger"));
    expect(meta.title).toBe("PayLedger — case study · Gabryel Veríssimo");
    expect(meta.description).toMatch(/double-entry payments API/);
    expect(meta.alternates?.canonical).toBe("/work/payledger");
  });

  it("gives the OG image a case-study-specific alt, not the generic file-convention one", async () => {
    const meta = await generateMetadata(params("payledger"));
    const images = meta.openGraph?.images as Array<{ alt?: string }> | undefined;
    expect(images?.[0]?.alt).toBe("PayLedger: case study");
  });

  it("renders header, disclosure, contents and neighbours", async () => {
    render(await CaseStudyPage(params("payledger")));
    expect(screen.getByRole("heading", { level: 1, name: "PayLedger" })).toBeInTheDocument();
    expect(screen.getByText(/AI-assisted development \(Claude Code\)/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Repo" })).toHaveAttribute("href", "https://github.com/gabryelvs/payledger");
    expect(screen.getByRole("navigation", { name: "On this page" }).querySelectorAll("a")).toHaveLength(7);
    expect(screen.getByRole("link", { name: /Next case study/ })).toHaveAttribute("href", "/work/webhook-inspector");
    expect(screen.getAllByRole("img", { name: "Sequence of a PayLedger transfer" })).toHaveLength(2);
    const primary = screen.getByRole("navigation", { name: "Primary" });
    expect(within(primary).getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("Work/PayLedger");
  });

  it("404s an unknown slug", async () => {
    await expect(CaseStudyPage(params("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("always links back to all work, even from the middle case study", async () => {
    render(await CaseStudyPage(params("webhook-inspector")));
    const nav = screen.getByRole("navigation", { name: "More case studies" });
    expect(within(nav).getByRole("link", { name: /Previous case study/ })).toHaveAttribute(
      "href",
      "/work/payledger",
    );
    expect(within(nav).getByRole("link", { name: /Next case study/ })).toHaveAttribute(
      "href",
      "/work/taskboard-api",
    );
    expect(within(nav).getByRole("link", { name: /All work/ })).toHaveAttribute("href", "/work");
  });
});

describe("/work", () => {
  it("lists every case study under one h1", () => {
    render(<WorkIndex />);
    expect(screen.getByRole("heading", { level: 1, name: "Selected work" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      expect.stringMatching(/^PayLedger/),
      expect.stringMatching(/^Webhook Inspector/),
      expect.stringMatching(/^Taskboard API/),
    ]);
  });
});
