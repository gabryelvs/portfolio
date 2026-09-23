import { describe, expect, it } from "vitest";
import * as ogImage from "@/app/work/[slug]/opengraph-image";
import { caseStudies } from "@/lib/work";

// Importing next/og under jsdom is safe here: we only read the plain exports
// (generateStaticParams, dynamicParams), never call the default Image export,
// which is the part that needs satori/resvg at request time.
describe("app/work/[slug]/opengraph-image", () => {
  it("statically generates exactly the three case studies and forbids any other slug", () => {
    expect(ogImage.generateStaticParams()).toEqual(caseStudies.map(({ slug }) => ({ slug })));
    expect(ogImage.dynamicParams).toBe(false);
  });
});
