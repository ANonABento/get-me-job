import type { LucideIcon } from "lucide-react";
import { Chrome, Compass, Globe } from "lucide-react";

export type SupportedBrowser = "chrome" | "edge" | "firefox" | "safari";
export type DetectedBrowser = SupportedBrowser | "unknown";
export type ExtensionLaunchState =
  | "local"
  | "private_beta"
  | "store_review"
  | "listed";

export interface ExtensionStore {
  key: SupportedBrowser;
  label: string;
  ctaLabel: string;
  compactLabel: string;
  url: string | null;
  icon: LucideIcon;
  disabled?: boolean;
}

type EnvSource = Record<string, string | undefined>;

function getStoreUrls(
  env: EnvSource = process.env,
): Record<SupportedBrowser, string | null> {
  return {
    chrome: env.NEXT_PUBLIC_CHROME_EXTENSION_URL ?? null,
    edge: env.NEXT_PUBLIC_EDGE_EXTENSION_URL ?? null,
    firefox: env.NEXT_PUBLIC_FIREFOX_EXTENSION_URL ?? null,
    safari: env.NEXT_PUBLIC_SAFARI_EXTENSION_URL ?? null,
  };
}

export function getExtensionLaunchState(
  env: EnvSource = process.env,
): ExtensionLaunchState {
  const raw = env.NEXT_PUBLIC_EXTENSION_LAUNCH_STATE?.trim();
  if (
    raw === "local" ||
    raw === "private_beta" ||
    raw === "store_review" ||
    raw === "listed"
  ) {
    return raw;
  }

  return Object.values(getStoreUrls(env)).some(Boolean) ? "listed" : "local";
}

export function getExtensionLaunchCopy(state = getExtensionLaunchState()): {
  label: string;
  description: string;
} {
  switch (state) {
    case "listed":
      return {
        label: "Store listings live",
        description: "Install from the available marketplace listing.",
      };
    case "store_review":
      return {
        label: "Store review",
        description:
          "Marketplace listings are in review. Join the waitlist for launch updates.",
      };
    case "private_beta":
      return {
        label: "Private beta",
        description:
          "The extension is available to early testers before public store launch.",
      };
    case "local":
    default:
      return {
        label: "Local install",
        description:
          "Store listings are not live yet. Self-hosters can build the extension locally.",
      };
  }
}

const STORE_URLS = getStoreUrls();

const ALL_EXTENSION_STORES: ExtensionStore[] = [
  {
    key: "chrome",
    label: "Chrome Web Store",
    ctaLabel: "Add to Chrome",
    compactLabel: "Chrome",
    url: STORE_URLS.chrome,
    icon: Chrome,
  },
  {
    key: "edge",
    label: "Microsoft Edge Add-ons",
    ctaLabel: "Add to Edge",
    compactLabel: "Edge",
    url: STORE_URLS.edge,
    icon: Compass,
  },
  {
    key: "firefox",
    label: "Firefox Add-ons",
    ctaLabel: "Add to Firefox",
    compactLabel: "Firefox",
    url: STORE_URLS.firefox,
    icon: Globe,
  },
  {
    key: "safari",
    label: "Safari",
    ctaLabel: "Add to Safari",
    compactLabel: "Safari",
    url: STORE_URLS.safari,
    icon: Compass,
  },
];

export const EXTENSION_STORES: ExtensionStore[] = ALL_EXTENSION_STORES.filter(
  (store) =>
    getExtensionLaunchState() === "listed" &&
    Boolean(store.url) &&
    !store.disabled,
);

export function detectBrowserFromUserAgent(userAgent: string): DetectedBrowser {
  const ua = userAgent.toLowerCase();

  if (!ua.trim()) return "unknown";
  if (/\bedg\//.test(ua)) return "edge";
  if (ua.includes("firefox/") || ua.includes("fxios/")) return "firefox";
  if (
    ua.includes("chrome/") ||
    ua.includes("chromium/") ||
    ua.includes("crios/")
  ) {
    return "chrome";
  }
  if (
    ua.includes("safari/") &&
    !ua.includes("chrome/") &&
    !ua.includes("chromium/") &&
    !ua.includes("crios/") &&
    !ua.includes("edg/")
  ) {
    return "safari";
  }

  return "unknown";
}

export function getExtensionStoresForBrowser(
  detectedBrowser: DetectedBrowser,
): ExtensionStore[] {
  const detected = EXTENSION_STORES.find(
    (store) => store.key === detectedBrowser,
  );

  if (!detected) return EXTENSION_STORES;

  return [
    detected,
    ...EXTENSION_STORES.filter((store) => store.key !== detected.key),
  ];
}
