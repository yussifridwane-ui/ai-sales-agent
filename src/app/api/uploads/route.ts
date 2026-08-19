import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { storeUpload } from "@/lib/security/uploads";
import { AppError } from "@/lib/errors";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { org, user } = await requireAuthOrg(req, "knowledge.write");
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new AppError("invalid_input", "Fichier requis.");
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = storeUpload({
      organizationId: org.id,
      filename: file.name,
      mime: file.type || "application/octet-stream",
      buffer,
    });
    await audit({ organizationId: org.id, userId: user.id, action: "file.upload", entity: "file", entityId: stored.id });
    return jsonOk({ file: { id: stored.id, name: stored.storedName } }, 201);
  } catch (e) {
    return jsonError(e);
  }
}
