import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAuthOrg } from "@/lib/api-guard";
import { count, findMany, rows, sum } from "@/lib/db";
import type { AnalyticsEvent } from "@/lib/db/types";

function rangeStart(range: string) {
  const days = range === "90" ? 90 : range === "30" ? 30 : range === "7" ? 7 : range === "today" ? 1 : 30;
  return new Date(Date.now() - days * 86400000).toISOString();
}

export async function GET(req: NextRequest) {
  try {
    const { org } = await requireAuthOrg(req);
    const range = req.nextUrl.searchParams.get("range") || "30";
    const start = req.nextUrl.searchParams.get("from") || rangeStart(range);
    const orgId = org.id;

    const conversations = count("conversations", { organizationId: orgId }, "createdAt >= ?", [start]);
    const conversationsToday = count(
      "conversations",
      { organizationId: orgId },
      "createdAt >= ?",
      [new Date().toISOString().slice(0, 10)],
    );
    const leads = count("leads", { organizationId: orgId }, "createdAt >= ?", [start]);
    const qualified = count("leads", { organizationId: orgId }, "score >= 61 AND createdAt >= ?", [start]);
    const orders = count("orders", { organizationId: orgId }, "createdAt >= ?", [start]);
    const revenue = sum("orders", "total", { organizationId: orgId }, "paymentStatus = 'paid' AND createdAt >= ?", [start]);
    const aiRevenue = sum(
      "orders",
      "total",
      { organizationId: orgId },
      "paymentStatus = 'paid' AND attributedToAi = 1 AND createdAt >= ?",
      [start],
    );
    const abandoned = count("conversations", { organizationId: orgId }, "status = 'abandoned' AND createdAt >= ?", [start]);
    const followUps = count("analytics_events", { organizationId: orgId, name: "follow_up" }, "createdAt >= ?", [start]);
    const aov = orders ? revenue / Math.max(1, count("orders", { organizationId: orgId }, "paymentStatus = 'paid' AND createdAt >= ?", [start])) : 0;
    const conversion = conversations ? (orders / conversations) * 100 : 0;

    const events = findMany<AnalyticsEvent>(
      "analytics_events",
      { organizationId: orgId },
      { extra: "createdAt >= ?", extraParams: [start], orderBy: "createdAt ASC", limit: 2000 },
    );

    const byDay: Record<string, { sales: number; conversations: number; revenue: number }> = {};
    for (const e of events) {
      const day = e.createdAt.slice(0, 10);
      if (!byDay[day]) byDay[day] = { sales: 0, conversations: 0, revenue: 0 };
      if (e.name === "conversation") byDay[day].conversations += e.value || 1;
      if (e.name === "order_created") byDay[day].sales += 1;
      if (e.name === "payment_received") byDay[day].revenue += e.value || 0;
    }

    const usage = rows<{ model: string; tokensIn: number; tokensOut: number; estimatedCost: number }>(
      `SELECT model, SUM(tokensIn) as tokensIn, SUM(tokensOut) as tokensOut, SUM(estimatedCost) as estimatedCost
       FROM usage_records WHERE organizationId = ? AND createdAt >= ? GROUP BY model`,
      [orgId, start],
    );

    return jsonOk({
      kpis: {
        conversationsToday,
        conversations,
        leads,
        qualified,
        orders,
        revenue,
        aiRevenue,
        conversion,
        aov,
        abandoned,
        followUps,
      },
      series: Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, ...v })),
      usage,
      currency: org.currency,
    });
  } catch (e) {
    return jsonError(e);
  }
}
