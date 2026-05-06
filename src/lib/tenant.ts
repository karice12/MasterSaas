/**
 * Tenant Resolver Utility
 * Extracts original company slug from the hostname
 */

export function getTenantSlug(): string | null {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  // 1. Ignore localhost and internal IP addresses
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes("run.app")) {
    // For development, we can use a query param fallback if we really want to test
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("tenant");
  }

  // 2. Ignore common subdomains
  const ignoredSubdomains = ["www", "admin", "dev", "api", "master"];
  
  if (parts.length >= 3) {
    const subdomain = parts[0].toLowerCase();
    if (!ignoredSubdomains.includes(subdomain)) {
      return subdomain;
    }
  }

  return null;
}
