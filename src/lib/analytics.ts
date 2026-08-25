import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const MEASUREMENT_ID = import.meta.env
  .VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as string | undefined;

type GtagArgs = [string, Date] | [string, string, Record<string, unknown>?];

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

let injected = false;

function injectGtag(measurementId: string) {
  if (injected) return;
  injected = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: GtagArgs) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", measurementId, {
    send_page_view: false,
  });
}

export function useAnalytics() {
  useEffect(() => {
    if (!MEASUREMENT_ID) return;
    injectGtag(MEASUREMENT_ID);
  }, []);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);
}
