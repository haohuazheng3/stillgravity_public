import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "What She Won't Tell You: the complete playbook for attraction, dating, and becoming the man she chooses.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "The dating playbook nobody gave you",
    title: "What She Won’t Tell You",
    subtitle: "83 one-page chapters. No pickup lines. No mind games.",
    withCover: true,
  });
}
