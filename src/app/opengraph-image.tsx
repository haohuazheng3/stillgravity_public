import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "Still Gravity: attraction isn't a trick, it's gravity.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Field guides for men",
    title: "Attraction isn’t a trick. It’s gravity.",
    subtitle: "Honest, research-backed answers for the moments that keep men up at night.",
  });
}
