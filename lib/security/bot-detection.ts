import "server-only";

const BLOCKED_USER_AGENTS = [
  "sqlmap",
  "nikto",
  "nmap",
  "masscan",
  "dirbuster",
  "wpscan",
  "hydra",
  "burpcollaborator",
  "acunetix",
  "nessus",
  "zap",
  "arachni",
  "w3af",
  "skipfish",
  "gobuster",
  "ffuf",
  "wfuzz",
  "nuclei",
  "httpx",
  "subfinder",
  "amass",
  "theharvester",
  "shodan",
  "censys",
  "crawler",
  "scraper",
  "bot",
  "spider",
  "curl",
  "wget",
  "python-requests",
  "python-urllib",
  "go-http-client",
  "java/",
  "okhttp",
  "httpclient",
  "libwww",
  "scrapy",
  "mechanize",
  "httpx",
  "aiohttp",
  "axios",
  "node-fetch",
  "postman",
  "insomnia",
  "httpie",
];

const ALLOWED_BOTS = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "telegrambot",
  "whatsapp",
  "applebot",
  "semrushbot",
  "ahrefsbot",
];

function normalizeUserAgent(ua: string | null): string {
  return (ua ?? "").toLowerCase().trim();
}

export function isBlockedBot(userAgent: string | null): boolean {
  const ua = normalizeUserAgent(userAgent);
  if (ua.length === 0) return false;
  if (ALLOWED_BOTS.some((bot) => ua.includes(bot))) return false;
  return BLOCKED_USER_AGENTS.some((blocked) => ua.includes(blocked));
}

export function isSuspiciousRequest(request: Request): boolean {
  const ua = request.headers.get("user-agent");
  if (!ua || ua.length < 10) return true;
  if (isBlockedBot(ua)) return true;
  const accept = request.headers.get("accept");
  if (accept && accept.length === 0) return true;
  return false;
}

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
]);

export function isInternalHost(hostname: string): boolean {
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
