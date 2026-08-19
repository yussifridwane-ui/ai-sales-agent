import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "AI Sales Agent — Votre commercial IA travaille 24h/24",
    template: "%s · AI Sales Agent",
  },
  description:
    "Transformez automatiquement vos conversations en prospects qualifiés et en ventes. Agent commercial IA pour WhatsApp, Instagram, site web et email.",
  keywords: [
    "AI sales agent",
    "AI sales assistant",
    "AI customer service",
    "WhatsApp sales automation",
    "Instagram sales automation",
    "AI ecommerce assistant",
    "AI chatbot for business",
  ],
  openGraph: {
    title: "AI Sales Agent — Votre commercial IA travaille 24h/24",
    description: "Conversation → qualification → recommandation → commande → paiement → suivi.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Sales Agent",
    description: "Votre commercial IA travaille 24h/24.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
