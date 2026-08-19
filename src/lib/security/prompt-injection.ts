import { securityEvent } from "./events";

const PATTERNS = [
  /ignore(?:\s+all)?(?:\s+previous)?(?:\s+your)?\s+instructions/i,
  /oublie (tes|vos) instructions/i,
  /révèle?(r)? (ton|votre|le) prompt/i,
  /reveal (your )?(system )?prompt/i,
  /show (me )?(the )?(system )?prompt/i,
  /donne[- ]moi la cl[eé] api/i,
  /give me (the )?(api key|secret|token)/i,
  /données des autres (clients|entreprises)/i,
  /other (customers?|tenants?|organizations?)/i,
  /jailbreak/i,
  /developer mode/i,
  /act as (the )?system/i,
];

export function detectPromptInjection(text: string) {
  return PATTERNS.some((p) => p.test(text));
}

export function promptInjectionReply(language = "fr") {
  return language.startsWith("fr")
    ? "Je ne peux pas modifier mes instructions, révéler le prompt système, ni partager des secrets ou des données d'autres entreprises. Comment puis-je vous aider concernant nos produits ?"
    : "I cannot change my instructions, reveal the system prompt, or share secrets or other companies' data. How can I help with our products?";
}

export function notePromptInjection(input: { organizationId?: string; conversationId?: string; ip?: string }) {
  securityEvent({
    type: "ai.prompt_injection",
    severity: "HIGH",
    message: "Tentative de prompt injection bloquée",
    organizationId: input.organizationId,
    meta: { conversationId: input.conversationId },
    ip: input.ip,
  });
}
