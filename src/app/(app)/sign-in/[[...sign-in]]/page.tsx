import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Owner sign-in",
  description: "Sign-in for running Still Gravity. Buyers never need an account.",
  robots: { index: false, follow: false },
};

/** Only the owner signs in (admin area). Buyers pay with their email and get the PDF by email. */
export default async function SignInPage(props: PageProps<"/sign-in/[[...sign-in]]">) {
  const sp = await props.searchParams;
  // Only same-site paths are accepted as a destination after sign-in (no open redirects).
  const raw = typeof sp.redirect_url === "string" ? sp.redirect_url : undefined;
  let redirect: string | undefined;
  if (raw) {
    try {
      const u = new URL(raw, "https://stillgravity.com");
      const sameSite = u.origin === "https://stillgravity.com" || u.hostname === "localhost" || u.hostname.endsWith(".vercel.app");
      if (sameSite || raw.startsWith("/")) redirect = `${u.pathname}${u.search}`;
    } catch {
      redirect = undefined;
    }
  }
  if (redirect && (redirect.startsWith("//") || redirect.startsWith("/sign-in"))) redirect = undefined;

  return (
    <div className="px-3 pt-10 sm:px-5 sm:pt-16">
      <div className="mx-auto grid max-w-[1000px] items-center gap-8 lg:grid-cols-[1fr_440px] lg:gap-14">
        <div className="order-2 min-w-0 lg:order-1">
          <p className="eyebrow eyebrow-accent">Owner sign-in</p>
          <h1 className="display mt-4 text-[2.3rem] text-ink sm:text-[3.2rem]">This page is for running the site.</h1>
          <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-ink-3">
            Buying the book never needs an account: you pay on Stripe with your email and the PDF arrives in your inbox, ready to download
            the moment you pay.
          </p>
          <p className="mt-6 text-[0.95rem] text-ink-3">
            Already bought it and need the file again?{" "}
            <Link href="/download" className="underline underline-offset-4">
              Get your copy again
            </Link>
            .
          </p>
        </div>
        <div className="order-1 min-w-0 lg:order-2">
          <div className="slab-ink p-5 sm:p-8">
            <p className="mb-5 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#f0b752]">Admin</p>
            <SignIn withSignUp routing="path" path="/sign-in" fallbackRedirectUrl={redirect ?? "/admin"} signUpFallbackRedirectUrl={redirect ?? "/admin"} />
          </div>
        </div>
      </div>
    </div>
  );
}
