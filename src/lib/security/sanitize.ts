export function sanitizeText(value: unknown, max = 8000) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .slice(0, max);
}

export function stripSecrets(text: string) {
  return text
    .replace(/(sk-|rk_|whsec_|ghp_|xox[baprs]-)[A-Za-z0-9_\-]{8,}/g, "[redacted]")
    .replace(/(api[_-]?key|secret|token|password)\s*[:=]\s*\S+/gi, "$1=[redacted]");
}

export function looksLikeSecret(text: string) {
  return /(sk-|rk_|whsec_|BEGIN (RSA |OPENSSH )?PRIVATE KEY|api[_-]?key\s*[:=])/i.test(text);
}
