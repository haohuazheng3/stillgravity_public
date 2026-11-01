/**
 * Where analytics need opt-in consent: the EU and EEA, the UK and Switzerland, plus territories
 * that sit inside the EU (Åland, the French outermost regions) or follow UK-style data law
 * (Gibraltar, the Crown Dependencies) but get their own country code from IP lookups.
 */
const OPT_IN = new Set([
  // EU 27
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  // EEA, UK, Switzerland
  "IS", "LI", "NO", "GB", "CH",
  // EU territories with their own codes
  "AX", "GF", "GP", "MQ", "RE", "YT", "MF",
  // UK-style data law
  "GI", "GG", "JE", "IM",
]);

/** Unknown location (local dev, privacy relays) counts as opt-in: the conservative default. */
export function consentRequiredFor(country: string | null | undefined): boolean {
  const c = (country ?? "").trim().toUpperCase();
  return !c || c === "XX" || OPT_IN.has(c);
}
