import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const font = (weight: 400 | 600) =>
  readFile(join(process.cwd(), `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`));

export async function ogImage({ title, subtitle, kicker }: { title: string; subtitle: string; kicker: string }) {
  const [regular, semibold] = await Promise.all([font(400), font(600)]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", background: "#08090a", color: "#f7f8f8", fontFamily: "Inter" }}>
        <div style={{ display: "flex", fontSize: 26, color: "#8a8f98" }}>{kicker}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 600, letterSpacing: -3, lineHeight: 1.02 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 32, color: "#b6bac1", lineHeight: 1.4, maxWidth: 980 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", height: 1, background: "#2f3137" }} />
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter", data: regular, style: "normal", weight: 400 },
        { name: "Inter", data: semibold, style: "normal", weight: 600 },
      ],
    },
  );
}
