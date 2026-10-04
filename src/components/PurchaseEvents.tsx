"use client";

import { useEffect } from "react";
import { ANALYTICS_LOADED_EVENT } from "./Consent";
import { CHECKOUT_NONCE, CHECKOUT_STASH } from "./CheckoutStarter";

/**
 * Fires FlowGlance purchase + unlock once per Checkout Session (deduped across reloads)
 * and forgets the finished checkout attempt, so a later purchase starts a fresh session.
 */
export function PurchaseEvents({ sessionId, orderId, amount, currency }: { sessionId: string; orderId: string; amount: number; currency: string }) {
  useEffect(() => {
    try {
      sessionStorage.removeItem(CHECKOUT_STASH);
      sessionStorage.removeItem(CHECKOUT_NONCE);
    } catch {
      /* fine */
    }
    const key = `sg_purchase_${sessionId}`;
    try {
      if (localStorage.getItem(key)) return;
    } catch {
      /* fine: worst case the event fires twice and FlowGlance dedupes on id */
    }
    const send = () => {
      try {
        window.fw?.("event", "purchase", { amount: amount / 100, currency: currency.toUpperCase(), item: "what-she-wont-tell-you", id: orderId });
        window.fw?.("event", "unlock", { item: "what-she-wont-tell-you", id: orderId });
        try {
          localStorage.setItem(key, "1");
        } catch {
          /* fine */
        }
      } catch (e) {
        console.warn("[analytics] purchase event failed", e);
      }
    };
    if (window.fw) send();
    else window.addEventListener(ANALYTICS_LOADED_EVENT, send, { once: true });
    return () => window.removeEventListener(ANALYTICS_LOADED_EVENT, send);
  }, [sessionId, orderId, amount, currency]);
  return null;
}
