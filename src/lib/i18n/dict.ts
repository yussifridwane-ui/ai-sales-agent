export type Locale = "fr" | "en" | "es" | "pt" | "de" | "ar";

export const defaultLocale: Locale = "fr";

export const dict = {
  fr: {
    brand: "AI Sales Agent",
    slogan: "Votre commercial IA travaille 24h/24.",
    sub: "Transformez automatiquement vos conversations en prospects qualifiés et en ventes.",
    ctaStart: "Commencer gratuitement",
    ctaHow: "Voir comment ça marche",
    login: "Connexion",
    register: "Créer un compte",
    dashboard: "Tableau de bord",
    conversations: "Conversations",
    leads: "Prospects",
    orders: "Commandes",
    products: "Produits",
    agents: "Agents",
    knowledge: "Connaissances",
    automations: "Automatisations",
    analytics: "Analytique",
    insights: "AI Insights",
    integrations: "Intégrations",
    billing: "Facturation",
    settings: "Paramètres",
    admin: "Admin",
    startFree: "Start Free",
  },
  en: {
    brand: "AI Sales Agent",
    slogan: "Your AI salesperson works 24/7.",
    sub: "Automatically turn conversations into qualified leads and sales.",
    ctaStart: "Start free",
    ctaHow: "See how it works",
    login: "Log in",
    register: "Create account",
    dashboard: "Dashboard",
    conversations: "Conversations",
    leads: "Leads",
    orders: "Orders",
    products: "Products",
    agents: "Agents",
    knowledge: "Knowledge",
    automations: "Automations",
    analytics: "Analytics",
    insights: "AI Insights",
    integrations: "Integrations",
    billing: "Billing",
    settings: "Settings",
    admin: "Admin",
    startFree: "Start Free",
  },
} as const;

export function t(locale: string, key: keyof (typeof dict)["fr"]) {
  const loc = locale.startsWith("fr") ? "fr" : "en";
  return dict[loc][key];
}
