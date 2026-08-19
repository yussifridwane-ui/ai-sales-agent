import type { Product } from "../db/types";
import { detectIntent, type Intent } from "./intent";

function matchProducts(text: string, products: Product[]) {
  const lower = text.toLowerCase();
  const scored = products
    .filter((p) => p.status === "active" && !p.forbiddenForAi)
    .map((p) => {
      const hay = `${p.name} ${p.description || ""} ${p.category || ""}`.toLowerCase();
      let s = 0;
      for (const w of lower.split(/\W+/).filter((x) => x.length > 2)) {
        if (hay.includes(w)) s += 2;
      }
      return { p, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  if (scored.length) return scored.slice(0, 3).map((x) => x.p);
  return products.filter((p) => p.status === "active" && !p.forbiddenForAi).slice(0, 3);
}

export function demoReply(input: {
  text: string;
  language: string;
  tone: string;
  company: string;
  agentName: string;
  products: Product[];
  knowledge: { title: string; content: string; type: string }[];
  objections: { phrase: string; response: string }[];
  maxDiscountPct: number;
  currency: string;
}): { reply: string; intent: Intent; escalate: boolean; recommendIds: string[]; wantOrder: boolean } {
  const intent = detectIntent(input.text);
  const recs = matchProducts(input.text, input.products);
  const fr = input.language.startsWith("fr");
  const escalate = intent === "human" || intent === "complaint";
  const wantOrder = intent === "purchase";

  const formatP = (p: Product) =>
    fr
      ? `• ${p.name} — ${p.price} ${p.currency}${p.available && p.stock > 0 ? "" : " (disponibilité à confirmer)"}`
      : `• ${p.name} — ${p.price} ${p.currency}${p.available && p.stock > 0 ? "" : " (availability to confirm)"}`;

  if (intent === "opt_out") {
    return {
      reply: fr
        ? "Bien reçu. Je n'enverrai plus de messages marketing. Vous pouvez toujours nous écrire si vous avez besoin d'aide."
        : "Understood. I will stop marketing messages. You can still write if you need help.",
      intent,
      escalate: false,
      recommendIds: [],
      wantOrder: false,
    };
  }

  if (intent === "human" || intent === "complaint") {
    return {
      reply: fr
        ? "Je transmets cette conversation à un conseiller humain. Un membre de l'équipe reprendra le fil dès que possible."
        : "I'm transferring this conversation to a human teammate. Someone will pick it up shortly.",
      intent,
      escalate: true,
      recommendIds: [],
      wantOrder: false,
    };
  }

  if (intent === "discount") {
    const obj = input.objections.find((o) => /rédu|remise|discount|cher/i.test(o.phrase));
    const reply =
      obj?.response ||
      (input.maxDiscountPct > 0
        ? fr
          ? `Nous pouvons appliquer une remise maximale de ${input.maxDiscountPct} % selon les conditions. Je ne peux pas aller au-delà.`
          : `We can apply a maximum discount of ${input.maxDiscountPct}% when eligible. I cannot go beyond that.`
        : fr
          ? "Je n'ai pas de remise configurée. Je vais vérifier cette information avec notre équipe."
          : "No discount is configured. I'll check this with our team.");
    return { reply, intent, escalate: false, recommendIds: recs.map((p) => p.id), wantOrder: false };
  }

  if (intent === "price") {
    if (!recs.length) {
      return {
        reply: fr
          ? "Je vais vérifier cette information avec notre équipe — aucun tarif n'est encore configuré pour cet article."
          : "I'll check with our team — no price is configured for that item yet.",
        intent,
        escalate: false,
        recommendIds: [],
        wantOrder: false,
      };
    }
    const lines = recs.map(formatP).join("\n");
    return {
      reply: fr
        ? `Voici les tarifs issus du catalogue ${input.company} :\n${lines}\nSouhaitez-vous que je prépare une commande ?`
        : `Here are catalog prices from ${input.company}:\n${lines}\nShall I prepare an order?`,
      intent,
      escalate: false,
      recommendIds: recs.map((p) => p.id),
      wantOrder: false,
    };
  }

  if (intent === "availability") {
    const p = recs[0];
    if (!p) {
      return {
        reply: fr
          ? "Je vais vérifier cette information avec notre équipe."
          : "I'll verify this information with our team.",
        intent,
        escalate: false,
        recommendIds: [],
        wantOrder: false,
      };
    }
    return {
      reply: fr
        ? `${p.name} : ${p.available && p.stock > 0 ? `${p.stock} en stock` : "disponibilité à confirmer avec l'équipe"}.`
        : `${p.name}: ${p.available && p.stock > 0 ? `${p.stock} in stock` : "availability must be confirmed with the team"}.`,
      intent,
      escalate: false,
      recommendIds: [p.id],
      wantOrder: false,
    };
  }

  if (intent === "shipping") {
    const doc = input.knowledge.find((k) => /livr|ship|delivery/i.test(`${k.title} ${k.type} ${k.content}`));
    return {
      reply: doc
        ? doc.content.slice(0, 400)
        : fr
          ? "Je vais vérifier cette information avec notre équipe — la politique de livraison n'est pas encore renseignée."
          : "I'll check with our team — the shipping policy is not configured yet.",
      intent,
      escalate: !doc,
      recommendIds: recs.map((p) => p.id),
      wantOrder: false,
    };
  }

  if (intent === "objection") {
    const hit = input.objections.find((o) => input.text.toLowerCase().includes(o.phrase.toLowerCase().slice(0, 12)));
    return {
      reply:
        hit?.response ||
        (fr
          ? "Je comprends. Dites-moi ce qui vous retient — le budget, le délai ou une comparaison — et je vous aide avec les informations du catalogue, sans pression."
          : "I understand. Tell me what's holding you back — budget, timing, or a comparison — and I'll help with catalog facts, no pressure."),
      intent,
      escalate: false,
      recommendIds: recs.map((p) => p.id),
      wantOrder: false,
    };
  }

  if (intent === "purchase") {
    const p = recs[0] || input.products.find((x) => x.status === "active");
    if (!p) {
      return {
        reply: fr
          ? "Je peux préparer une commande dès qu'un produit est ajouté au catalogue."
          : "I can prepare an order as soon as a product is in the catalog.",
        intent,
        escalate: false,
        recommendIds: [],
        wantOrder: false,
      };
    }
    return {
      reply: fr
        ? `Parfait. Je prépare une commande pour ${p.name} à ${p.price} ${p.currency}. Pouvez-vous me confirmer votre nom, email et téléphone pour finaliser ?`
        : `Great. I'll prepare an order for ${p.name} at ${p.price} ${p.currency}. Please confirm your name, email and phone to finalize.`,
      intent,
      escalate: false,
      recommendIds: [p.id],
      wantOrder: true,
    };
  }

  if (intent === "appointment") {
    return {
      reply: fr
        ? "Je peux qualifier votre besoin et transmettre un rendez-vous à l'équipe. Quel créneau vous conviendrait, et quel est l'objectif de l'échange ?"
        : "I can qualify your request and pass an appointment to the team. What time works, and what's the goal of the call?",
      intent,
      escalate: false,
      recommendIds: recs.map((p) => p.id),
      wantOrder: false,
    };
  }

  const recText = recs.length
    ? fr
      ? `\nJe peux vous recommander :\n${recs.map(formatP).join("\n")}`
      : `\nI can recommend:\n${recs.map(formatP).join("\n")}`
    : "";

  if (intent === "greeting") {
    return {
      reply: fr
        ? `Bonjour, je suis ${input.agentName}, l'assistant commercial de ${input.company}. Comment puis-je vous aider aujourd'hui ?${recText}`
        : `Hi, I'm ${input.agentName}, the sales assistant for ${input.company}. How can I help you today?${recText}`,
      intent,
      escalate: false,
      recommendIds: recs.map((p) => p.id),
      wantOrder: false,
    };
  }

  return {
    reply: fr
      ? `Merci. Pour bien vous orienter, quel besoin cherchez-vous à résoudre ?${recText}\nSi une information manque, je la vérifierai avec l'équipe plutôt que d'inventer.`
      : `Thanks. To point you in the right direction, what problem are you trying to solve?${recText}\nIf something isn't configured, I'll check with the team rather than invent it.`,
    intent,
    escalate: false,
    recommendIds: recs.map((p) => p.id),
    wantOrder: false,
  };
}
