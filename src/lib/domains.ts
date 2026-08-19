/**
 * Official public hostnames — same pattern as santeonline.tg
 * Register the apex at an ARCEP-accredited .tg registrar, then point DNS here.
 */
export const BRAND_DOMAIN = "ventesonline.tg";

export const DOMAINS = {
  apex: BRAND_DOMAIN,
  www: `www.${BRAND_DOMAIN}`,
  marketing: BRAND_DOMAIN,
  app: `app.${BRAND_DOMAIN}`,
  admin: `admin.${BRAND_DOMAIN}`,
  api: `api.${BRAND_DOMAIN}`,
  widget: `w.${BRAND_DOMAIN}`,
} as const;

export const EMAILS = {
  from: `VentesOnline <noreply@${BRAND_DOMAIN}>`,
  support: `support@${BRAND_DOMAIN}`,
  hello: `hello@${BRAND_DOMAIN}`,
};

export function publicOrigin() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") return `https://${DOMAINS.app}`;
  return "http://localhost:3000";
}

export function marketingOrigin() {
  if (process.env.MARKETING_URL) return process.env.MARKETING_URL.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") return `https://${DOMAINS.marketing}`;
  return publicOrigin();
}

export function widgetScriptUrl() {
  return `${publicOrigin()}/widget.js`;
}

export const DNS_RECORDS = [
  { host: "@", type: "A", value: "<IP du serveur>" },
  { host: "www", type: "CNAME", value: BRAND_DOMAIN },
  { host: "app", type: "CNAME", value: BRAND_DOMAIN },
  { host: "admin", type: "CNAME", value: BRAND_DOMAIN },
  { host: "api", type: "CNAME", value: BRAND_DOMAIN },
  { host: "w", type: "CNAME", value: BRAND_DOMAIN },
];
