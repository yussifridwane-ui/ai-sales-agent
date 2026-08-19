export const CURRENCIES = [
  "EUR",
  "USD",
  "GBP",
  "CAD",
  "AUD",
  "XOF",
  "XAF",
  "NGN",
  "GHS",
  "KES",
  "ZAR",
  "MAD",
  "BRL",
  "MXN",
  "JPY",
  "CHF",
  "INR",
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number] | string;

export function formatMoney(amount: number, currency = "USD", locale = "en") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "XOF" || currency === "XAF" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export const COUNTRIES = [
  { code: "FR", name: "France" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "TG", name: "Togo" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "SN", name: "Senegal" },
  { code: "BJ", name: "Benin" },
  { code: "GH", name: "Ghana" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "MA", name: "Morocco" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "MX", name: "Mexico" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "OTHER", name: "Other" },
];

export const INDUSTRIES = [
  "ecommerce",
  "restaurant",
  "real_estate",
  "education",
  "beauty",
  "health",
  "services",
  "saas",
  "agency",
  "automotive",
  "travel",
  "other",
] as const;

export const SALES_GOALS = ["sell", "appointments", "quotes", "qualify", "support"] as const;

export const TONES = ["professional", "friendly", "premium", "direct", "warm"] as const;

export const LANGUAGES = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
  { code: "de", name: "Deutsch" },
  { code: "ar", name: "العربية" },
] as const;
