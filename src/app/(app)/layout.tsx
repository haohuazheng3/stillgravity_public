import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IdentifyUser } from "@/components/IdentifyUser";
import { clerkAppearance } from "@/lib/clerk-appearance";

/* Personal pages: never indexed, never cached. Clerk's JS only loads in this part of the site. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance} signInUrl="/sign-in" signInFallbackRedirectUrl="/account" afterSignOutUrl="/">
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <IdentifyUser />
    </ClerkProvider>
  );
}
