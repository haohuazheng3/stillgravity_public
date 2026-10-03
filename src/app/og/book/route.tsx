import { ogCard } from "@/lib/og";

export const dynamic = "force-static";

/** Stable share image for the book (file-based OG routes get hashed URLs in Next 16). */
export function GET() {
  return ogCard({
    eyebrow: "The dating playbook nobody gave you",
    title: "What She Won’t Tell You",
    subtitle: "83 one-page chapters. No pickup lines. No mind games.",
    withCover: true,
  });
}
