const ALLOWED_PROTOCOLS = new Set(["https:", "http:"]);

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "169.254.169.254",
]);

function isInternalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.startsWith("10.")) return true;
  if (host.startsWith("192.168.")) return true;
  if (host.startsWith("172.")) {
    const octet = Number(host.split(".")[1]);
    if (octet >= 16 && octet <= 31) return true;
  }
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  return false;
}

export function sanitizeExternalUrl(value: string) {
  const url = new URL(value);
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new Error("Unsupported external URL protocol");
  }
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("External URLs must use HTTPS in production");
  }
  if (isInternalHost(url.hostname)) {
    throw new Error("Internal URLs are not allowed");
  }
  if (url.username || url.password) {
    throw new Error("URLs with credentials are not allowed");
  }
  return url;
}
