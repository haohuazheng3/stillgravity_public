import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { CookieSettingsLink } from "@/components/Consent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cookie policy",
  description: "The cookies and local storage stillgravity.com uses: essential checkout cookies, your consent choice, theme preference, and FlowGlance analytics. No sign-in cookies for buyers.",
  path: "/cookie-policy",
});

const ROWS = [
  ["sg_consent", "Essential", "Remembers your analytics choice so we don’t ask again.", "180 days"],
  ["sg-theme (local storage)", "Preference", "Remembers if you chose the light or dark theme. Never sent to us.", "Until cleared"],
  ["Stripe cookies", "Essential", "Set by Stripe on checkout.stripe.com to process payments and prevent fraud.", "Set by Stripe"],
  ["FlowGlance identifiers", "Analytics", "Recognize repeat visits and connect page views into journeys. Only set when analytics are on.", "Set by FlowGlance"],
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie policy"
      path="/cookie-policy"
      updated="2026-10-04"
      intro="We keep this short: there are no accounts and no sign-in cookies for buyers. A few essential cookies so checkout works, one preference, and our only analytics tool."
    >
      <h2>What we use</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[0.92rem]">
          <thead>
            <tr className="border-b border-line text-ink">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Purpose</th>
              <th className="py-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r[0]} className="border-b border-line align-top">
                <td className="py-2.5 pr-3 font-medium text-ink-2">{r[0]}</td>
                <td className="py-2.5 pr-3">{r[1]}</td>
                <td className="py-2.5 pr-3">{r[2]}</td>
                <td className="py-2.5">{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Analytics and your choice</h2>
      <p>
        FlowGlance records page activity, including text you submit in forms and images you upload. In the EU, EEA, UK and
        Switzerland it only runs after you accept it; everywhere else it runs by default and you can opt out. Your choice applies
        from the next page you load.
      </p>
      <p>
        <CookieSettingsLink /> ← change your choice at any time.
      </p>

      <h2>Blocking cookies</h2>
      <p>
        You can block or delete cookies in your browser settings. If you block essential cookies, checkout may not work. (Our
        own admin area uses Clerk sign-in cookies; buyers never receive them.)
      </p>
    </LegalPage>
  );
}
