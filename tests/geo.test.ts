import { describe, expect, it } from "vitest";
import { consentRequiredFor } from "@/lib/geo";

describe("consentRequiredFor", () => {
  it("asks for consent in the EU, EEA, UK and Switzerland", () => {
    for (const c of ["DE", "FR", "IE", "NO", "IS", "GB", "CH", "re", " gb "]) expect(consentRequiredFor(c)).toBe(true);
  });

  it("treats an unknown location as the EU", () => {
    for (const c of [null, undefined, "", "XX"]) expect(consentRequiredFor(c)).toBe(true);
  });

  it("loads analytics directly everywhere else", () => {
    for (const c of ["US", "CA", "AU", "IN", "BR", "JP", "SG", "TR", "UA", "RS"]) expect(consentRequiredFor(c)).toBe(false);
  });
});
