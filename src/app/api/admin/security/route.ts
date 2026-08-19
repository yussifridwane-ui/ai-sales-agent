import { NextRequest } from "next/server";
import { jsonError, jsonOk, requirePlatformAdmin } from "@/lib/api-guard";
import { runSecurityChecks } from "@/lib/security/checks";
import { recentSecurityEvents, securityEventCounts } from "@/lib/security/events";
import { createBackup, listBackups, testRestore } from "@/lib/security/backup";
import { audit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    await requirePlatformAdmin(req);
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const report = runSecurityChecks();
    return jsonOk({
      status: report.status,
      checks: report.checks,
      events: recentSecurityEvents(60),
      counts: securityEventCounts(since),
      backups: listBackups(),
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requirePlatformAdmin(req);
    const { action, path: backupPath } = (await req.json()) as { action?: string; path?: string };
    if (action === "backup") {
      const backup = createBackup(admin.id);
      await audit({ userId: admin.id, action: "security.backup" });
      return jsonOk({ backup });
    }
    if (action === "test_restore" && backupPath) {
      if (!backupPath.includes("/data/backups/") || backupPath.includes("..")) {
        return jsonError(new Error("invalid"));
      }
      const result = testRestore(backupPath);
      return jsonOk({ restoreTest: result });
    }
    return jsonOk({ ok: false });
  } catch (e) {
    return jsonError(e);
  }
}
