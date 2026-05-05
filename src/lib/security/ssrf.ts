import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export class SsrfBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SsrfBlockedError";
  }
}

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Hostnames that resolve to a private network must never be reachable from
 * server-side fetches. The classic SSRF attack is to send the server a URL
 * pointing at the AWS metadata endpoint (169.254.169.254) or an internal
 * service. This list covers the IETF private/reserved ranges plus common
 * cloud-metadata IPs.
 */
const BLOCKED_CIDRS: Array<[string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // link-local incl. AWS/GCP metadata 169.254.169.254
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved
];

const BLOCKED_HOSTNAME_SUFFIXES = [
  ".local",
  ".internal",
  ".localhost",
];

function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function inCidr(ip: string, cidr: [string, number]): boolean {
  const [base, mask] = cidr;
  const ipInt = ipToInt(ip);
  const baseInt = ipToInt(base);
  if (mask === 0) return true;
  const shift = 32 - mask;
  return ipInt >>> shift === baseInt >>> shift;
}

export function isBlockedIPv4(ip: string): boolean {
  if (isIP(ip) !== 4) return false;
  return BLOCKED_CIDRS.some((cidr) => inCidr(ip, cidr));
}

/**
 * Block IPv6 loopback (::1), unspecified (::), link-local (fe80::/10),
 * unique-local (fc00::/7), and IPv4-mapped IPv6 addresses whose embedded
 * IPv4 is in a blocked range (e.g. ::ffff:127.0.0.1).
 *
 * Why this matters: when DNS resolves a public-looking hostname to an IPv6
 * address pointing at the host itself or an internal network, an IPv4-only
 * filter would let the request through.
 */
export function isBlockedIPv6(ip: string): boolean {
  if (isIP(ip) !== 6) return false;
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  // fe80::/10 — link-local. The /10 mask covers fe80–febf, but in practice
  // implementations only emit fe80:.
  if (
    lower.startsWith("fe8") ||
    lower.startsWith("fe9") ||
    lower.startsWith("fea") ||
    lower.startsWith("feb")
  ) {
    return true;
  }
  // fc00::/7 — unique local addresses. First byte is fc or fd.
  if (/^f[cd][0-9a-f]{0,2}:/.test(lower)) return true;
  // ::ffff:a.b.c.d — IPv4-mapped IPv6. Reject if the embedded IPv4 is blocked.
  if (lower.startsWith("::ffff:")) {
    const tail = lower.slice("::ffff:".length);
    if (isIP(tail) === 4 && isBlockedIPv4(tail)) return true;
  }
  return false;
}

export function isBlockedIP(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isBlockedIPv4(ip);
  if (family === 6) return isBlockedIPv6(ip);
  return false;
}

function isBlockedHostnameLiteral(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower === "ip6-localhost") return true;
  if (BLOCKED_HOSTNAME_SUFFIXES.some((s) => lower.endsWith(s))) return true;
  // IPv6 loopback / link-local / ULA
  if (lower === "::1" || lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) {
    return true;
  }
  return false;
}

export interface AssertSafeOutboundUrlOptions {
  /** Hostnames (or parent domains) the URL must match. Subdomains allowed. */
  allowedHosts?: string[];
  /**
   * Override the DNS lookup. Tests can pass a fixed IP. If omitted, performs
   * a real `dns.lookup` so private IPs cannot be reached even when the URL's
   * hostname is public.
   */
  dnsLookup?: (hostname: string) => Promise<string>;
}

function hostMatchesAllowed(host: string, allowed: string[]): boolean {
  const lower = host.toLowerCase();
  return allowed.some((domain) => {
    const d = domain.toLowerCase();
    return lower === d || lower.endsWith(`.${d}`);
  });
}

/**
 * Validate a URL is safe to fetch from server-side code.
 *
 * Throws `SsrfBlockedError` when:
 *   - the URL is malformed
 *   - the protocol is not http/https
 *   - the hostname is `localhost`, `*.local`, etc.
 *   - the hostname resolves to a private/reserved IP range
 *   - an `allowedHosts` allowlist is supplied and the host is not on it
 *
 * Why DNS resolution matters: an attacker controlling DNS for a public-looking
 * domain can still point it at 127.0.0.1 or 169.254.169.254 (AWS metadata).
 * URL-only validation does not catch this; we must resolve and re-check.
 */
export async function assertSafeOutboundUrl(
  rawUrl: string,
  options: AssertSafeOutboundUrlOptions = {},
): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SsrfBlockedError("Invalid URL.");
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new SsrfBlockedError(
      `Only http and https URLs are allowed (got ${url.protocol}).`,
    );
  }

  const hostname = url.hostname;
  if (!hostname) {
    throw new SsrfBlockedError("URL is missing a hostname.");
  }

  if (isBlockedHostnameLiteral(hostname)) {
    throw new SsrfBlockedError(
      `Hostname ${hostname} resolves to a private network.`,
    );
  }

  if (options.allowedHosts && options.allowedHosts.length > 0) {
    if (!hostMatchesAllowed(hostname, options.allowedHosts)) {
      throw new SsrfBlockedError(
        `Hostname ${hostname} is not on the allow list.`,
      );
    }
  }

  // If the hostname is already an IP literal, check it directly.
  if (isIP(hostname)) {
    if (isBlockedIP(hostname)) {
      throw new SsrfBlockedError(
        `IP ${hostname} is in a private/reserved range.`,
      );
    }
    return url;
  }

  // DNS-resolve and check against the private CIDR list. Pluggable so tests
  // can inject a stub.
  const lookupFn =
    options.dnsLookup ??
    (async (h: string) => {
      const result = await lookup(h);
      return result.address;
    });

  const ip = await lookupFn(hostname);
  if (isBlockedIP(ip)) {
    throw new SsrfBlockedError(
      `Hostname ${hostname} resolves to a private/reserved IP (${ip}).`,
    );
  }

  return url;
}
