"use client";

import { useEffect, useState } from "react";

function hasDebugQuery(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

export function useDevMode(): boolean {
  const isDev = process.env.NODE_ENV === "development";
  const [isDebugQuery, setIsDebugQuery] = useState(hasDebugQuery);

  useEffect(() => {
    setIsDebugQuery(hasDebugQuery());
  }, []);

  return isDev || isDebugQuery;
}
