"use client";

import { useEffect } from "react";
import { siteConfig } from "@/config/site";

/**
 * Google Analytics component — domain-locked.
 * Only loads scripts when the hostname matches the allowed domain.
 */
export function GoogleAnalytics() {
  const { gaId, allowedHostname } = siteConfig.analytics;

  useEffect(() => {
    // Guard: don't fire on localhost or any other domain
    if (!gaId) return;
    if (typeof window === "undefined") return;
    if (window.location.hostname !== allowedHostname) return;

    // Dynamically inject the GA script
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize dataLayer
    const inlineScript = document.createElement("script");
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(inlineScript);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(inlineScript);
    };
  }, [gaId, allowedHostname]);

  return null;
}
