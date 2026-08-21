const ALLOWED_PROTOCOLS = new Set(["https:", "http:"]);

export function sanitizeExternalUrl(value: string) {
  const url = new URL(value);
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new Error("Unsupported external URL protocol");
  }
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("External URLs must use HTTPS in production");
  }
  return url;
}
