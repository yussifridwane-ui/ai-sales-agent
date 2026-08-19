import { findMany, findOne, insert, nowIso, updateWhere } from "../db";
import { log } from "../logger";
import { parseJson } from "../crypto";
import type { AutomationRule, Conversation, Organization, Plan, Subscription } from "../db/types";

type Action =
  | { type: "send_message"; content: string }
  | { type: "wait"; hours: number }
  | { type: "follow_up"; content: string }
  | { type: "assign_human" }
  | { type: "change_status"; status: string }
  | { type: "notify_team"; title: string; body: string }
  | { type: "create_task"; title: string };

export async function runAutomations(
  organizationId: string,
  trigger: string,
  payload: Record<string, unknown>,
) {
  const org = findOne<Organization>("organizations", { id: organizationId });
  if (!org) return [];
  const sub = findOne<Subscription>("subscriptions", { organizationId });
  const plan = sub ? findOne<Plan>("plans", { id: sub.planId }) : undefined;
  if (!plan?.automationsEnabled) return [];

  const rules = findMany<AutomationRule>("automation_rules", { organizationId, isActive: 1, trigger });
  const runs: string[] = [];
  for (const rule of rules) {
    const runId = insert("automation_runs", {
      organizationId,
      ruleId: rule.id,
      status: "processing",
      payload: JSON.stringify(payload),
    });
    try {
      const actions = parseJson<Action[]>(rule.actions, []);
      for (const action of actions) await applyAction(organizationId, action, payload);
      updateWhere("automation_runs", { id: runId }, { status: "completed", completedAt: nowIso(), result: "ok" });
      runs.push(runId);
    } catch (err) {
      log("ERROR", "automation_failed", { ruleId: rule.id, error: String(err) });
      updateWhere("automation_runs", { id: runId }, { status: "failed", completedAt: nowIso(), result: String(err) });
    }
  }
  return runs;
}

async function applyAction(organizationId: string, action: Action, payload: Record<string, unknown>) {
  const conversationId = typeof payload.conversationId === "string" ? payload.conversationId : null;
  if (action.type === "send_message" || action.type === "follow_up") {
    if (!conversationId) return;
    const convo = findOne<Conversation>("conversations", { id: conversationId, organizationId });
    if (!convo || convo.optedOut) return;
    insert("messages", {
      organizationId,
      conversationId,
      role: "assistant",
      content: action.content,
      generatedByAi: true,
      metadata: JSON.stringify({ automation: true }),
    });
    updateWhere("conversations", { id: conversationId }, { lastMessageAt: nowIso() });
  }
  if (action.type === "assign_human" && conversationId) {
    updateWhere("conversations", { id: conversationId }, { humanTakeover: true, status: "transferred" });
  }
  if (action.type === "change_status" && conversationId) {
    updateWhere("conversations", { id: conversationId }, { status: action.status });
  }
  if (action.type === "notify_team" || action.type === "create_task") {
    insert("notifications", {
      organizationId,
      type: action.type,
      title: action.title,
      body: action.type === "notify_team" ? action.body : action.title,
      href: conversationId ? `/app/conversations/${conversationId}` : "/app/dashboard",
    });
  }
}

export async function processFollowUps() {
  const cutoff2h = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const abandoned = findMany<Conversation>("conversations", { optedOut: 0, humanTakeover: 0, isDemo: 0 }, {
    extra: "status IN ('new','open','qualified') AND lastMessageAt <= ?",
    extraParams: [cutoff2h],
    limit: 50,
  });
  const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const cutoff72h = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
  for (const c of abandoned) {
    await runAutomations(c.organizationId, "no_reply", { conversationId: c.id });
    if (c.lastMessageAt <= cutoff72h) {
      updateWhere("conversations", { id: c.id }, { status: "abandoned" });
    } else if (c.lastMessageAt <= cutoff24h) {
      insert("analytics_events", { organizationId: c.organizationId, name: "follow_up", value: 24 });
    }
  }
}
