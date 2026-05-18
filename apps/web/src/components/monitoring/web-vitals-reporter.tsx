"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      metricId: metric.id,
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      rating: metric.rating,
      navigationType: metric.navigationType,
      pathname: window.location.pathname,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/monitoring/vitals", blob);
      return;
    }

    void fetch("/api/monitoring/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  });

  return null;
}
