import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { clerkAppearance } from "@/lib/clerk-appearance";

/* The owner's admin area and its sign-in: never indexed, never cached. Clerk's JS only loads here. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance} signInUrl="/sign-in" signInFallbackRedirectUrl="/admin" afterSignOutUrl="/">
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
    </ClerkProvider>
  );
}
