import assert from "node:assert/strict";
import { exec, findOne, insert, count } from "../src/lib/db";
import { completeOnboarding, ensurePlans } from "../src/lib/onboarding";
import { processInboundMessage } from "../src/lib/ai/sales-engine";
import { hashPassword, verifyPassword } from "../src/lib/crypto";
import type { Conversation, Organization, Product, User } from "../src/lib/db/types";

async function main() {
  ensurePlans();

  const hash = await hashPassword("Secret123!");
  assert.equal(await verifyPassword("Secret123!", hash), true);
  assert.equal(await verifyPassword("nope", hash), false);

  const userA = insert("users", {
    email: `a-${Date.now()}@test.local`,
    passwordHash: hash,
    name: "Org A Owner",
    status: "active",
  });
  const userB = insert("users", {
    email: `b-${Date.now()}@test.local`,
    passwordHash: hash,
    name: "Org B Owner",
    status: "active",
  });

  const a = completeOnboarding({
    userId: userA,
    companyName: "Alpha Co",
    country: "FR",
    currency: "EUR",
    industry: "saas",
    salesGoal: "sell",
    agentName: "Ava",
    tone: "professional",
    languages: ["fr"],
  });
  const b = completeOnboarding({
    userId: userB,
    companyName: "Beta Co",
    country: "US",
    currency: "USD",
    industry: "ecommerce",
    salesGoal: "sell",
    agentName: "Ben",
    tone: "friendly",
    languages: ["en"],
  });

  insert("products", {
    organizationId: a.organizationId,
    name: "Alpha Plan",
    price: 29,
    currency: "EUR",
    stock: 10,
    status: "active",
    available: true,
  });
  insert("products", {
    organizationId: b.organizationId,
    name: "Beta Shoes",
    price: 80,
    currency: "USD",
    stock: 5,
    status: "active",
    available: true,
  });

  const productsA = exec
    ? (await import("../src/lib/db")).findMany<Product>("products", { organizationId: a.organizationId })
    : [];
  const leak = productsA.some((p) => p.organizationId === b.organizationId || p.name === "Beta Shoes");
  assert.equal(leak, false);
  const other = findOne<Product>("products", { id: "missing", organizationId: a.organizationId });
  assert.equal(other, undefined);

  const orgB = findOne<Organization>("organizations", { id: b.organizationId })!;
  assert.equal(orgB.id !== a.organizationId, true);

  const leadId = insert("leads", {
    organizationId: a.organizationId,
    firstName: "Test",
    channel: "website",
  });
  const convoId = insert("conversations", {
    organizationId: a.organizationId,
    leadId,
    agentId: a.agentId,
    channel: "website",
    lastMessageAt: new Date().toISOString(),
  });
  const result = await processInboundMessage({
    organizationId: a.organizationId,
    conversationId: convoId,
    content: "Votre produit coûte combien ?",
    from: "customer",
  });
  assert.ok(result);
  assert.equal("intent" in result && result.intent === "price", true);
  if ("reply" in result && result.reply) {
    assert.equal(/80/.test(result.reply), false);
    assert.match(result.reply, /29|Alpha|catalogue|équipe|EUR/i);
  }

  const stolen = findOne<Conversation>("conversations", { id: convoId, organizationId: b.organizationId });
  assert.equal(stolen, undefined);

  const before = count("conversations", { organizationId: a.organizationId });
  assert.ok(before >= 1);

  const user = findOne<User>("users", { id: userA });
  assert.ok(user);

  console.log("All tests passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
