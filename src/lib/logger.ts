type Level = "INFO" | "WARNING" | "ERROR" | "SECURITY" | "BILLING" | "AI" | "WEBHOOK";

const SECRET_KEYS = /password|secret|token|authorization|api[_-]?key|cookie|mfaSecret/i;

function redact(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SECRET_KEYS.test(k)) out[k] = "[redacted]";
    else out[k] = v;
  }
  return out;
}

export function log(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(redact(meta) as Record<string, unknown>),
  };
  if (level === "ERROR" || level === "SECURITY") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}
