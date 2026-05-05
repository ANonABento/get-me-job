import { describe, expect, it } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders, __testables } from "./headers";

function makeRequest(url: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(new URL(url), {
    headers: new Headers(headers),
  });
}

describe("applySecurityHeaders", () => {
  it("sets a Content-Security-Policy that disallows object-src and frame-ancestors", () => {
    const res = applySecurityHeaders(
      NextResponse.next(),
      makeRequest("https://taida.app/dashboard"),
    );
    const csp = res.headers.get("Content-Security-Policy");
    expect(csp).toBeTruthy();
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("default-src 'self'");
  });

  it("does not allow unsafe-eval", () => {
    expect(__testables.CSP_HEADER_VALUE).not.toContain("unsafe-eval");
  });

  it("emits HSTS only over HTTPS", () => {
    const httpsRes = applySecurityHeaders(
      NextResponse.next(),
      makeRequest("https://taida.app/"),
    );
    expect(httpsRes.headers.get("Strict-Transport-Security")).toContain(
      "max-age=31536000",
    );

    const httpRes = applySecurityHeaders(
      NextResponse.next(),
      makeRequest("http://localhost:3000/"),
    );
    expect(httpRes.headers.get("Strict-Transport-Security")).toBeNull();
  });

  it("respects x-forwarded-proto for HSTS in proxied environments", () => {
    const res = applySecurityHeaders(
      NextResponse.next(),
      makeRequest("http://internal:3000/", { "x-forwarded-proto": "https" }),
    );
    expect(res.headers.get("Strict-Transport-Security")).toBeTruthy();
  });

  it("locks down clickjacking and MIME sniffing", () => {
    const res = applySecurityHeaders(
      NextResponse.next(),
      makeRequest("https://taida.app/"),
    );
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  it("disables sensitive Permissions-Policy features by default", () => {
    const res = applySecurityHeaders(
      NextResponse.next(),
      makeRequest("https://taida.app/"),
    );
    const policy = res.headers.get("Permissions-Policy");
    expect(policy).toContain("camera=()");
    expect(policy).toContain("geolocation=()");
    expect(policy).toContain("payment=()");
    // microphone allowed for interview voice mode
    expect(policy).toContain("microphone=(self)");
  });

  it("does not overwrite an existing CSP header", () => {
    const upstream = NextResponse.next();
    upstream.headers.set("Content-Security-Policy", "default-src 'self'");
    const res = applySecurityHeaders(
      upstream,
      makeRequest("https://taida.app/"),
    );
    expect(res.headers.get("Content-Security-Policy")).toBe(
      "default-src 'self'",
    );
  });
});
