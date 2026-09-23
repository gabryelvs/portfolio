import { OG_SIZE, ogImage } from "@/lib/og";
import { ROLE, SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME}, ${ROLE}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    kicker: ROLE,
    title: SITE_NAME,
    subtitle: "Reliable systems for fintech: payments, ledgers and the services around them.",
  });
}
