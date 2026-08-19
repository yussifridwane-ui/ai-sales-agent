import { AppError } from "../errors";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal"]);

function isPrivateIp(hostname: string) {
  if (BLOCKED_HOSTS.has(hostname.toLowerCase())) return true;
  if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return true;
  const ipv4 = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

export function assertSafeUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new AppError("invalid_url", "URL invalide.", 400);
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new AppError("invalid_url", "Protocole URL non autorisé.", 400);
  }
  if (isPrivateIp(url.hostname)) {
    throw new AppError("ssrf_blocked", "Cette adresse n'est pas autorisée.", 400);
  }
  return url.toString();
}
