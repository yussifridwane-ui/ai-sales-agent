import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthFromRequest, jsonError, jsonOk } from "@/lib/api-guard";
import { completeOnboarding } from "@/lib/onboarding";
import { getMembership } from "@/lib/tenant";
import { AppError } from "@/lib/errors";
import { audit } from "@/lib/audit";

const schema = z.object({
  companyName: z.string().min(1),
  country: z.string().min(1),
  currency: z.string().min(1),
  industry: z.string().min(1),
  salesGoal: z.string().min(1),
  agentName: z.string().min(1),
  tone: z.string().min(1),
  languages: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req);
    if (!user) throw new AppError("unauthenticated", "Veuillez vous connecter.", 401);
    const existing = await getMembership(user.id);
    if (existing?.organization.onboardingDone) {
      return jsonOk({ already: true, organizationId: existing.organization.id });
    }
    const body = schema.parse(await req.json());
    const result = completeOnboarding({ userId: user.id, ...body });
    await audit({ userId: user.id, organizationId: result.organizationId, action: "onboarding.complete" });
    return jsonOk(result, 201);
  } catch (e) {
    return jsonError(e);
  }
}
