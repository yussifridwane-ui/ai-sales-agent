import bcrypt from "bcryptjs";
import { count, findOne, insert, removeWhere, uniqueSlug } from "../src/lib/db";
import { ensurePlans } from "../src/lib/onboarding";
import type { Plan, User } from "../src/lib/db/types";

async function main() {
  ensurePlans();

  const adminHash = await bcrypt.hash("Admin123!", 12);
  const demoHash = await bcrypt.hash("Demo123!", 12);

  let admin = findOne<User>("users", { email: "nina.v@example.com" });
  if (!admin) {
    insert("users", {
      id: "usr_admin",
      email: "nina.v@example.com",
      passwordHash: adminHash,
      name: "Platform Admin",
      platformRole: "admin",
      emailVerified: new Date().toISOString(),
      status: "active",
      locale: "en",
    });
    admin = findOne<User>("users", { email: "nina.v@example.com" })!;
  }

  let demoUser = findOne<User>("users", { email: "xena.w@example.org" });
  if (!demoUser) {
    insert("users", {
      id: "usr_demo",
      email: "xena.w@example.org",
      passwordHash: demoHash,
      name: "Maya Chen",
      platformRole: "user",
      emailVerified: new Date().toISOString(),
      status: "active",
      locale: "en",
    });
    demoUser = findOne<User>("users", { email: "xena.w@example.org" })!;
  }

  const business = findOne<Plan>("plans", { slug: "business" })!;
  const free = findOne<Plan>("plans", { slug: "free" })!;

  let demoOrgId = findOne<{ id: string }>("organizations", { slug: "demo-store" })?.id;
  if (!demoOrgId) {
    demoOrgId = insert("organizations", {
      name: "Demo Store",
      slug: "demo-store",
      country: "US",
      currency: "USD",
      industry: "ecommerce",
      salesGoal: "sell",
      website: "https://demo.aisalesagent.app",
      locale: "en",
      isDemo: true,
      onboardingDone: true,
      email: "xena.w@example.org",
      phone: "+1 415 555 0199",
      maxDiscountPct: 10,
      shippingPolicy: "Standard shipping 3–5 business days. Express 24–48h on selected items.",
      refundPolicy: "30-day returns on unused items with original packaging.",
    });
  }

  if (!findOne("organization_members", { organizationId: demoOrgId, userId: demoUser.id })) {
    insert("organization_members", { organizationId: demoOrgId, userId: demoUser.id, role: "owner" });
  }
  if (!findOne("subscriptions", { organizationId: demoOrgId })) {
    insert("subscriptions", {
      organizationId: demoOrgId,
      planId: business.id,
      status: "active",
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
    });
  }

  let agentId = findOne<{ id: string }>("agents", { id: "demo-agent-sarah" })?.id;
  if (!agentId) {
    agentId = insert("agents", {
      id: "demo-agent-sarah",
      organizationId: demoOrgId,
      name: "Sarah",
      avatar: "S",
      description: "Commerciale virtuelle Demo Store",
      language: "en",
      languages: JSON.stringify(["en", "fr"]),
      tone: "friendly",
      role: "virtual_salesperson",
      objective: "Transformer les prospects en clients.",
      instructions: "Be concise. Recommend from catalog only. Never invent discounts above 10%.",
      greeting: "Hi! I'm Sarah, your Demo Store sales assistant. What are you looking for today?",
      isDemo: true,
      isActive: true,
    });
  }
  if (!findOne("agent_instructions", { agentId })) {
    insert("agent_instructions", {
      organizationId: demoOrgId,
      agentId,
      roleBlock: "Virtual salesperson",
      restrictions: "Never invent prices. Max discount 10%.",
    });
  }

  const products = [
    {
      id: "demo-p-tee",
      name: "Premium T-Shirt",
      description: "Organic cotton tee with a tailored fit. Soft, durable, made for everyday wear.",
      category: "Apparel",
      price: 25,
      compareAtPrice: 35,
      stock: 80,
      sku: "TEE-PREM-01",
      colors: JSON.stringify(["Black", "White", "Navy"]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      features: JSON.stringify(["Organic cotton", "Tailored fit", "Machine washable"]),
    },
    {
      id: "demo-p-sneakers",
      name: "Sneakers Pro",
      description: "Lightweight performance sneakers with cushioned sole and breathable mesh.",
      category: "Footwear",
      price: 80,
      compareAtPrice: 110,
      stock: 24,
      sku: "SNK-PRO-01",
      colors: JSON.stringify(["White", "Black"]),
      sizes: JSON.stringify(["38", "39", "40", "41", "42", "43", "44"]),
      features: JSON.stringify(["Cushioned sole", "Breathable mesh", "All-day comfort"]),
    },
    {
      id: "demo-p-watch",
      name: "Smart Watch",
      description: "Fitness tracking, notifications and 5-day battery. Water resistant.",
      category: "Electronics",
      price: 49,
      compareAtPrice: 79,
      stock: 40,
      sku: "WCH-SMT-01",
      colors: JSON.stringify(["Graphite", "Silver"]),
      sizes: JSON.stringify([]),
      features: JSON.stringify(["Heart rate", "Sleep tracking", "5-day battery", "Water resistant"]),
    },
  ];
  for (const p of products) {
    if (!findOne("products", { id: p.id })) {
      insert("products", {
        ...p,
        organizationId: demoOrgId,
        currency: "USD",
        images: JSON.stringify([]),
        available: true,
        status: "active",
        isDemo: true,
        shippingInfo: "Ships in 24h from US warehouse.",
      });
    }
  }

  if (count("knowledge_documents", { organizationId: demoOrgId }) === 0) {
    insert("knowledge_documents", {
      organizationId: demoOrgId,
      title: "About Demo Store",
      type: "company",
      content:
        "Demo Store is an international lifestyle brand. We sell apparel, footwear and smart accessories. Customer service: xena.w@example.org",
      isDemo: true,
    });
    insert("knowledge_documents", {
      organizationId: demoOrgId,
      title: "Shipping policy",
      type: "shipping",
      content: "Standard 3–5 business days (USD 6). Express 24–48h (USD 14). Free shipping over USD 100.",
      isDemo: true,
    });
    insert("knowledge_documents", {
      organizationId: demoOrgId,
      title: "Returns",
      type: "returns",
      content: "30-day returns on unused items. Refunds processed within 5 business days.",
      isDemo: true,
    });
    insert("knowledge_documents", {
      organizationId: demoOrgId,
      title: "FAQ",
      type: "faq",
      content:
        "Q: Do you ship internationally? A: Yes, to most countries.\nQ: Warranty on Smart Watch? A: 12 months manufacturer warranty as configured.",
      isDemo: true,
    });
  }

  if (count("objections", { organizationId: demoOrgId }) === 0) {
    insert("objections", {
      organizationId: demoOrgId,
      phrase: "c'est trop cher",
      response:
        "I hear you. The current catalog price already reflects our configured offer. I can apply at most 10% if you qualify — I cannot invent a larger discount.",
    });
    insert("objections", {
      organizationId: demoOrgId,
      phrase: "je vais réfléchir",
      response: "Of course. I can send a short recap of the product and price from the catalog. No pressure.",
    });
    insert("objections", {
      organizationId: demoOrgId,
      phrase: "avez-vous une réduction ?",
      response: "Maximum configured discount is 10%. I will never go above that rule.",
    });
    insert("objections", {
      organizationId: demoOrgId,
      phrase: "je compare avec un autre produit",
      response: "Happy to compare using official specs from our catalog only. Which feature matters most?",
    });
  }

  if (count("sales_scripts", { organizationId: demoOrgId }) === 0) {
    insert("sales_scripts", {
      organizationId: demoOrgId,
      agentId,
      greeting: "Hi! I'm Sarah, your Demo Store sales assistant. What are you looking for today?",
      qualificationQuestions: JSON.stringify([
        "What are you looking for today?",
        "Is this for you or as a gift?",
        "Do you have a budget range?",
      ]),
      arguments: JSON.stringify(["Catalog-backed recommendations", "Fast shipping", "30-day returns"]),
      ctas: JSON.stringify(["I can reserve this item and send a payment link."]),
    });
  }

  if (count("automation_rules", { organizationId: demoOrgId }) === 0) {
    insert("automation_rules", {
      organizationId: demoOrgId,
      name: "Relance 24h sans réponse",
      trigger: "no_reply",
      conditions: JSON.stringify({ hours: 24 }),
      actions: JSON.stringify([
        { type: "follow_up", content: "Just checking in — still happy to help if you have questions." },
        { type: "notify_team", title: "Follow-up sent", body: "24h no-reply sequence" },
      ]),
      isActive: true,
      isDemo: true,
    });
  }

  if (!findOne("leads", { id: "demo-lead-1" })) {
    insert("leads", {
      id: "demo-lead-1",
      organizationId: demoOrgId,
      firstName: "Lucas",
      lastName: "Moreau",
      email: "lucas.moreau@example.com",
      phone: "+33601020304",
      country: "FR",
      source: "website",
      channel: "website",
      productInterest: "Sneakers Pro",
      budget: "80",
      score: 87,
      status: "qualified",
      notes: "Wants black, size 42. DEMO",
      isDemo: true,
      lastContactAt: new Date().toISOString(),
    });
  }
  if (!findOne("leads", { id: "demo-lead-2" })) {
    insert("leads", {
      id: "demo-lead-2",
      organizationId: demoOrgId,
      firstName: "Amina",
      lastName: "Diallo",
      email: "amina.diallo@example.com",
      country: "SN",
      source: "instagram",
      channel: "instagram",
      productInterest: "Premium T-Shirt",
      score: 44,
      status: "contacted",
      isDemo: true,
    });
  }

  if (count("conversations", { organizationId: demoOrgId }) === 0) {
    const convo1 = insert("conversations", {
      organizationId: demoOrgId,
      leadId: "demo-lead-1",
      agentId,
      channel: "website",
      status: "qualified",
      intent: "purchase",
      leadScore: 87,
      potentialValue: 80,
      isDemo: true,
      lastMessageAt: new Date().toISOString(),
    });
    insert("messages", {
      organizationId: demoOrgId,
      conversationId: convo1,
      role: "customer",
      content: "Hi, how much are the Sneakers Pro?",
    });
    insert("messages", {
      organizationId: demoOrgId,
      conversationId: convo1,
      role: "assistant",
      content:
        "Sneakers Pro are $80 USD (catalog price). Size 38–44, White or Black. Would you like me to reserve a pair?",
      generatedByAi: true,
    });
    insert("messages", {
      organizationId: demoOrgId,
      conversationId: convo1,
      role: "customer",
      content: "Black, size 42. Can I get a discount?",
    });
    insert("messages", {
      organizationId: demoOrgId,
      conversationId: convo1,
      role: "assistant",
      content: "Maximum configured discount is 10%. I can apply that if you confirm the order — I cannot go beyond 10%.",
      generatedByAi: true,
    });

    const convo2 = insert("conversations", {
      organizationId: demoOrgId,
      leadId: "demo-lead-2",
      agentId,
      channel: "instagram",
      status: "open",
      intent: "price",
      leadScore: 44,
      potentialValue: 25,
      isDemo: true,
      lastMessageAt: new Date().toISOString(),
    });
    insert("messages", {
      organizationId: demoOrgId,
      conversationId: convo2,
      role: "customer",
      content: "Le t-shirt premium est dispo en navy ?",
    });
    insert("messages", {
      organizationId: demoOrgId,
      conversationId: convo2,
      role: "assistant",
      content: "Yes — Premium T-Shirt is listed in Navy, White and Black at $25. Stock is configured at 80 units.",
      generatedByAi: true,
    });

    insert("orders", {
      id: "demo-order-1",
      organizationId: demoOrgId,
      number: "CMD-2026-10001",
      leadId: "demo-lead-1",
      conversationId: convo1,
      agentId,
      channel: "website",
      source: "ai_sales_agent",
      subtotal: 80,
      discount: 8,
      total: 72,
      currency: "USD",
      status: "paid",
      paymentStatus: "paid",
      isDemo: true,
      attributedToAi: true,
    });
    insert("order_items", {
      organizationId: demoOrgId,
      orderId: "demo-order-1",
      productId: "demo-p-sneakers",
      name: "Sneakers Pro",
      quantity: 1,
      unitPrice: 80,
      total: 80,
    });
    insert("payments", {
      organizationId: demoOrgId,
      orderId: "demo-order-1",
      provider: "demo",
      amount: 72,
      currency: "USD",
      status: "paid",
      isDemo: true,
      externalId: "demo_pay_10001",
    });
    insert("orders", {
      id: "demo-order-2",
      organizationId: demoOrgId,
      number: "CMD-2026-10002",
      leadId: "demo-lead-2",
      channel: "instagram",
      source: "ai_sales_agent",
      subtotal: 25,
      total: 25,
      currency: "USD",
      status: "pending",
      paymentStatus: "unpaid",
      isDemo: true,
      attributedToAi: true,
    });
    insert("order_items", {
      organizationId: demoOrgId,
      orderId: "demo-order-2",
      productId: "demo-p-tee",
      name: "Premium T-Shirt",
      quantity: 1,
      unitPrice: 25,
      total: 25,
    });
  }

  if (count("analytics_events", { organizationId: demoOrgId }) < 10) {
    for (let i = 0; i < 14; i++) {
      const createdAt = new Date(Date.now() - i * 86400000).toISOString();
      insert("analytics_events", { organizationId: demoOrgId, name: "conversation", value: 6 + (i % 4), createdAt });
      insert("analytics_events", { organizationId: demoOrgId, name: "ai_message", value: 12 + (i % 5), createdAt });
      insert("analytics_events", { organizationId: demoOrgId, name: "order_created", value: i % 3 === 0 ? 80 : 25, createdAt });
      insert("analytics_events", { organizationId: demoOrgId, name: "payment_received", value: i % 4 === 0 ? 72 : 0, createdAt });
    }
  }

  if (count("usage_records", { organizationId: demoOrgId }) === 0) {
    insert("usage_records", {
      organizationId: demoOrgId,
      agentId,
      model: "demo-engine",
      tokensIn: 4200,
      tokensOut: 6100,
      estimatedCost: 0.012,
    });
  }

  if (count("invoices", { organizationId: demoOrgId }) === 0) {
    insert("invoices", {
      organizationId: demoOrgId,
      number: "INV-2026-0001",
      amount: 2900,
      currency: "USD",
      status: "paid",
      periodStart: new Date(Date.now() - 30 * 86400000).toISOString(),
      periodEnd: new Date().toISOString(),
    });
  }

  if (!findOne("widget_settings", { organizationId: demoOrgId })) {
    insert("widget_settings", {
      organizationId: demoOrgId,
      agentId,
      greeting: "Hi! I'm Sarah, your Demo Store sales assistant.",
      allowedDomains: JSON.stringify(["*"]),
      enabled: true,
    });
  }

  for (const provider of ["whatsapp", "instagram", "website", "email", "stripe", "paypal"]) {
    if (!findOne("integrations", { organizationId: demoOrgId, provider })) {
      insert("integrations", {
        organizationId: demoOrgId,
        provider,
        status: provider === "website" ? "connected" : "not_connected",
        config: JSON.stringify({ mode: provider === "website" ? "live_widget" : "requires_setup" }),
      });
    }
  }

  let adminOrg = findOne<{ id: string }>("organizations", { slug: "platform-ops" });
  if (!adminOrg) {
    const orgId = insert("organizations", {
      name: "Platform Ops",
      slug: uniqueSlug("platform-ops"),
      country: "US",
      currency: "USD",
      industry: "saas",
      salesGoal: "support",
      onboardingDone: true,
    });
    insert("organization_members", { organizationId: orgId, userId: admin!.id, role: "owner" });
    insert("subscriptions", {
      organizationId: orgId,
      planId: free.id,
      status: "active",
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
    });
  }

  void removeWhere;
  console.log("Seed OK");
  console.log("Demo login: xena.w@example.org / Demo123!");
  console.log("Admin login: nina.v@example.com / Admin123!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
