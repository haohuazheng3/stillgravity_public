import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { BOOK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Open your library",
  description: "Sign in or create your Still Gravity library with just your email and a one-time code.",
  robots: { index: false, follow: false },
};

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
  const buying = redirect?.includes("/checkout");

  return (
    <div className="px-3 pt-10 sm:px-5 sm:pt-16">
      <div className="mx-auto grid max-w-[1000px] items-center gap-8 lg:grid-cols-[1fr_440px] lg:gap-14">
        <div className="order-2 min-w-0 lg:order-1">
          <p className="eyebrow eyebrow-accent">{buying ? "One step before checkout" : "Your library"}</p>
          <h1 className="display mt-4 text-[2.3rem] text-ink sm:text-[3.2rem]">
            {buying ? "Where should we keep your copy?" : "Email in. Code in. You’re in."}
          </h1>
          <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-ink-3">
            No password, ever. Type your email and the six-digit code we send. New here or coming back, it’s the same three steps
            {buying ? `, then you’re on Stripe’s secure checkout for ${BOOK.priceLabel}.` : "."}
          </p>
          <ul className="mt-6 space-y-2 text-[0.95rem] text-ink-3">
            <li>· Your purchase is tied to this email, so it can never get lost.</li>
            <li>· The same email opens your library on any device.</li>
            <li>· We never sell your email or send marketing you didn’t ask for.</li>
          </ul>
          <p className="mt-6 text-[0.85rem] text-ink-4">
            By continuing you agree to our <Link href="/terms" className="underline underline-offset-4">terms</Link> and{" "}
            <Link href="/privacy" className="underline underline-offset-4">privacy policy</Link>.
          </p>
        </div>
        <div className="order-1 min-w-0 lg:order-2">
          <div className="slab-ink p-5 sm:p-8">
            <p className="mb-5 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#f0b752]">
              Sign in or create your library
            </p>
            <SignIn
              withSignUp
              routing="path"
              path="/sign-in"
              fallbackRedirectUrl={redirect ?? "/account"}
              signUpFallbackRedirectUrl={redirect ?? "/account"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
