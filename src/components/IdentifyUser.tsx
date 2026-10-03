"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ANALYTICS_LOADED_EVENT } from "./Consent";

/**
 * Tells FlowGlance who a signed-in visitor is (fw identify), so journeys connect to
 * accounts and the owner's own visits can be filtered out of the numbers.
 */
export function IdentifyUser() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;
    const email = user.primaryEmailAddress?.emailAddress;
    const send = () => {
      try {
        window.fw?.("identify", { userRef: user.id, email });
      } catch (e) {
        console.warn("[analytics] identify failed", e);
      }
    };
    if (window.fw) send();
    else window.addEventListener(ANALYTICS_LOADED_EVENT, send, { once: true });
    return () => window.removeEventListener(ANALYTICS_LOADED_EVENT, send);
  }, [isLoaded, user]);

  return null;
}
