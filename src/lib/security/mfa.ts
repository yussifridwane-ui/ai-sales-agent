import { createHmac, randomBytes } from "crypto";
import { decryptSecret, encryptSecret, safeEqual } from "../crypto";
import { findOne, updateWhere } from "../db";
import { AppError } from "../errors";
import type { User } from "../db/types";

function base32Encode(buf: Buffer) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += alphabet[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(input: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.replace(/=+$/, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateMfaSecret() {
  return base32Encode(randomBytes(20));
}

export function totp(secret: string, step = 30, t = Date.now()) {
  const counter = Math.floor(t / 1000 / step);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter & 0xffffffff, 4);
  const hmac = createHmac("sha1", base32Decode(secret)).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(code % 1_000_000).padStart(6, "0");
}

export function verifyTotp(secret: string, code: string) {
  const normalized = (code || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  const now = Date.now();
  for (const delta of [-1, 0, 1]) {
    const expected = totp(secret, 30, now + delta * 30_000);
    if (safeEqual(expected, normalized)) return true;
  }
  return false;
}

export function enrollMfa(userId: string) {
  const secret = generateMfaSecret();
  updateWhere("users", { id: userId }, { mfaSecret: encryptSecret(secret), mfaEnabled: false });
  return secret;
}

export function confirmMfa(userId: string, code: string) {
  const user = findOne<User>("users", { id: userId });
  if (!user?.mfaSecret) throw new AppError("mfa_not_started", "Activez d'abord le MFA.", 400);
  const secret = decryptSecret(user.mfaSecret);
  if (!verifyTotp(secret, code)) throw new AppError("invalid_mfa", "Code MFA invalide.", 401);
  updateWhere("users", { id: userId }, { mfaEnabled: true });
}

export function assertAdminMfa(user: User, sessionMfaOk: boolean) {
  if (user.platformRole !== "admin") return;
  if (process.env.NODE_ENV === "production" && process.env.ENFORCE_ADMIN_MFA !== "0") {
    if (!user.mfaEnabled) throw new AppError("mfa_required", "MFA obligatoire pour l'administration.", 403);
    if (!sessionMfaOk) throw new AppError("mfa_challenge", "Validation MFA requise.", 403);
  }
}

export function otpauthUrl(email: string, secret: string) {
  return `otpauth://totp/AI%20Sales%20Agent:${encodeURIComponent(email)}?secret=${secret}&issuer=AI%20Sales%20Agent`;
}
