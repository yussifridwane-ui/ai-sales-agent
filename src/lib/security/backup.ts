import fs from "node:fs";
import path from "node:path";
import { createHash } from "crypto";
import { insert, findMany } from "../db";
import { nowIso } from "../db";

export function createBackup(triggeredBy?: string) {
  const src = process.env.SQLITE_PATH || path.join(process.cwd(), "data", "aisales.db");
  const dir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(dir, `aisales-${stamp}.db`);
  if (!fs.existsSync(src)) throw new Error("no_database");
  fs.copyFileSync(src, dest);
  const buf = fs.readFileSync(dest);
  const checksum = createHash("sha256").update(buf).digest("hex");
  const id = insert("backups", {
    path: dest,
    checksum,
    size: buf.length,
    triggeredBy: triggeredBy || "system",
    restoreTested: false,
    createdAt: nowIso(),
  });
  return { id, path: dest, checksum, size: buf.length, restoreTested: false };
}

export function listBackups() {
  return findMany("backups", {}, { orderBy: "createdAt DESC", limit: 20 });
}

export function testRestore(backupPath: string) {
  const { DatabaseSync } = require("node:sqlite") as typeof import("node:sqlite");
  const db = new DatabaseSync(backupPath, { readOnly: true });
  const row = db.prepare("SELECT COUNT(*) as n FROM users").get() as { n: number };
  db.close();
  return { ok: true, users: Number(row.n) };
}
