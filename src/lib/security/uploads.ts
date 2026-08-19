import { randomBytes } from "crypto";
import fs from "node:fs";
import path from "node:path";
import { AppError } from "../errors";
import { insert } from "../db";

const ALLOWED: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "text/csv": [".csv"],
};

const MAX_BYTES = 5 * 1024 * 1024;

export function assertSafeUpload(input: { filename: string; mime: string; size: number }) {
  if (input.size <= 0 || input.size > MAX_BYTES) {
    throw new AppError("file_too_large", "Fichier trop volumineux (max 5 Mo).", 400);
  }
  const ext = path.extname(input.filename || "").toLowerCase();
  const allowedExt = ALLOWED[input.mime];
  if (!allowedExt || !allowedExt.includes(ext)) {
    throw new AppError("file_type", "Type de fichier non autorisé.", 400);
  }
  if (input.filename.includes("..") || input.filename.includes("/") || input.filename.includes("\\")) {
    throw new AppError("file_name", "Nom de fichier invalide.", 400);
  }
  return ext;
}

export function storeUpload(input: {
  organizationId: string;
  filename: string;
  mime: string;
  buffer: Buffer;
}) {
  const ext = assertSafeUpload({ filename: input.filename, mime: input.mime, size: input.buffer.length });
  const stored = `${randomBytes(16).toString("hex")}${ext}`;
  const dir = path.join(process.cwd(), "data", "uploads", input.organizationId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, stored), input.buffer, { mode: 0o600 });
  const id = insert("file_assets", {
    organizationId: input.organizationId,
    originalName: path.basename(input.filename).slice(0, 180),
    storedName: stored,
    mime: input.mime,
    size: input.buffer.length,
  });
  return { id, storedName: stored };
}
