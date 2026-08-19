export type Intent =
  | "price"
  | "information"
  | "comparison"
  | "purchase"
  | "objection"
  | "discount"
  | "shipping"
  | "availability"
  | "appointment"
  | "complaint"
  | "human"
  | "opt_out"
  | "greeting"
  | "other";

const RULES: { intent: Intent; patterns: RegExp[] }[] = [
  {
    intent: "opt_out",
    patterns: [/\bstop\b/i, /ne (me )?(plus )?contact/i, /unsubscribe/i, /désabon/i, /opt[ -]?out/i],
  },
  {
    intent: "human",
    patterns: [/humain/i, /conseiller/i, /parler (à|a) quelqu/i, /human/i, /agent réel/i, /real person/i],
  },
  {
    intent: "complaint",
    patterns: [/plainte/i, /scam/i, /arnaque/i, /inadmissible/i, /complaint/i, /refund now/i, /scandale/i],
  },
  {
    intent: "purchase",
    patterns: [/acheter/i, /commander/i, /je prends/i, /add to cart/i, /buy now/i, /je veux (ce|le|la)/i, /checkout/i],
  },
  {
    intent: "discount",
    patterns: [/réduction/i, /remise/i, /promo/i, /discount/i, /coupon/i, /moins cher/i],
  },
  {
    intent: "price",
    patterns: [/prix/i, /co[uû]te/i, /tarif/i, /combien/i, /price/i, /how much/i, /cuesta/i],
  },
  {
    intent: "shipping",
    patterns: [/livr/i, /shipping/i, /delivery/i, /délai/i, /expédi/i],
  },
  {
    intent: "availability",
    patterns: [/stock/i, /disponible/i, /availability/i, /in stock/i, /rupture/i],
  },
  {
    intent: "appointment",
    patterns: [/rendez[- ]vous/i, /rdv/i, /appointment/i, /book a call/i, /démo/i],
  },
  {
    intent: "comparison",
    patterns: [/compar/i, /vs\b/i, /différence/i, /better than/i, /autre produit/i],
  },
  {
    intent: "objection",
    patterns: [/trop cher/i, /je vais réfléchir/i, /plus tard/i, /too expensive/i, /think about it/i, /partenaire/i],
  },
  {
    intent: "greeting",
    patterns: [/^(bonjour|salut|hello|hi|hey|bonsoir|hola)\b/i],
  },
  {
    intent: "information",
    patterns: [/c'est quoi/i, /comment/i, /what is/i, /tell me/i, /info/i, /caractéristique/i],
  },
];

export function detectIntent(text: string): Intent {
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(text))) return rule.intent;
  }
  return "other";
}

export function scoreLead(input: {
  previous: number;
  intent: Intent;
  mentionedBudget: boolean;
  mentionedProduct: boolean;
  messageCount: number;
  askedHuman: boolean;
}) {
  let score = input.previous;
  const bump: Record<Intent, number> = {
    greeting: 4,
    information: 6,
    price: 10,
    availability: 8,
    shipping: 8,
    comparison: 9,
    discount: 8,
    objection: 5,
    purchase: 22,
    appointment: 14,
    complaint: -8,
    human: 0,
    opt_out: -20,
    other: 3,
  };
  score += bump[input.intent] ?? 3;
  if (input.mentionedBudget) score += 8;
  if (input.mentionedProduct) score += 7;
  if (input.messageCount >= 4) score += 5;
  if (input.askedHuman) score += 2;
  return Math.max(0, Math.min(100, score));
}

export function scoreLabel(score: number) {
  if (score <= 30) return { key: "cold", fr: "Froid", en: "Cold" };
  if (score <= 60) return { key: "interested", fr: "Intéressé", en: "Interested" };
  if (score <= 80) return { key: "qualified", fr: "Qualifié", en: "Qualified" };
  return { key: "hot", fr: "Très chaud", en: "Hot" };
}

export function conversationStatusFromScore(score: number, intent: Intent, purchased: boolean) {
  if (purchased) return "ordered";
  if (intent === "human" || intent === "complaint") return "transferred";
  if (score >= 61) return "qualified";
  if (score >= 15) return "open";
  return "new";
}
