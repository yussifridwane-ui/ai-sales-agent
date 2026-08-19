type Level = "INFO" | "WARNING" | "ERROR" | "SECURITY" | "BILLING" | "AI" | "WEBHOOK";

export function log(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  if (level === "ERROR" || level === "SECURITY") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}
