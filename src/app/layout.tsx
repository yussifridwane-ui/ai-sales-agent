import type { Metadata } from "next";
import "./globals.css";
import { marketingOrigin } from "@/lib/domains";

export const metadata: Metadata = {
  metadataBase: new URL(marketingOrigin()),
  title: {
    default: "AI Sales Agent — Transformez vos conversations en ventes",
    template: "%s · AI Sales Agent",
  },
  description:
    "AI Sales Agent répond à vos clients, recommande vos produits, qualifie les prospects et transforme les conversations en commandes — 24h/24.",
  keywords: [
    "AI sales agent",
    "AI sales assistant",
    "WhatsApp sales automation",
    "Instagram sales automation",
    "AI ecommerce assistant",
  ],
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "AI Sales Agent — Transformez vos conversations en ventes",
    description: "Conversation → qualification → recommandation → commande → paiement → suivi.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{const m=localStorage.getItem("ais-theme")||"system";const d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
