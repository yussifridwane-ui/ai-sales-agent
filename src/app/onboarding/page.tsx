"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COUNTRIES, CURRENCIES, INDUSTRIES, LANGUAGES, SALES_GOALS, TONES } from "@/lib/currency";

const industryLabel: Record<string, string> = {
  ecommerce: "E-commerce",
  restaurant: "Restauration",
  real_estate: "Immobilier",
  education: "Formation",
  beauty: "Beauté",
  health: "Santé",
  services: "Services",
  saas: "SaaS",
  agency: "Agence",
  automotive: "Automobile",
  travel: "Voyage",
  other: "Autre",
};

const goalLabel: Record<string, string> = {
  sell: "Vendre",
  appointments: "Obtenir des rendez-vous",
  quotes: "Obtenir des devis",
  qualify: "Qualifier des prospects",
  support: "Support commercial",
};

const toneLabel: Record<string, string> = {
  professional: "Professionnel",
  friendly: "Amical",
  premium: "Premium",
  direct: "Direct",
  warm: "Chaleureux",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    country: "FR",
    currency: "EUR",
    industry: "ecommerce",
    salesGoal: "sell",
    agentName: "Alex - Sales Assistant",
    tone: "professional",
    languages: ["fr"] as string[],
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function finish() {
    setError("");
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Impossible de terminer.");
      return;
    }
    router.push("/app/dashboard?ready=1");
  }

  return (
    <div className="grid-bg min-h-screen px-4 py-10">
      <div className="mx-auto max-w-xl">
        <p className="text-sm text-teal-300">Créons votre commercial IA en 3 minutes.</p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-teal-400" style={{ width: `${(step / 8) * 100}%` }} />
        </div>
        <div className="card mt-6 space-y-5 p-8">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-semibold">Nom de l&apos;entreprise</h1>
              <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="North Studio" />
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-semibold">Pays</h1>
              <select value={form.country} onChange={(e) => set("country", e.target.value)}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-semibold">Devise</h1>
              <select value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </>
          )}
          {step === 4 && (
            <>
              <h1 className="text-2xl font-semibold">Secteur</h1>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRIES.map((i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => set("industry", i)}
                    className={`rounded-xl border px-3 py-2 text-sm ${form.industry === i ? "border-teal-400 bg-teal-400/10" : "border-white/10"}`}
                  >
                    {industryLabel[i]}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <h1 className="text-2xl font-semibold">Objectif commercial</h1>
              <div className="space-y-2">
                {SALES_GOALS.map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => set("salesGoal", g)}
                    className={`block w-full rounded-xl border px-3 py-2 text-left text-sm ${form.salesGoal === g ? "border-teal-400 bg-teal-400/10" : "border-white/10"}`}
                  >
                    {goalLabel[g]}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 6 && (
            <>
              <h1 className="text-2xl font-semibold">Nom de l&apos;agent</h1>
              <input value={form.agentName} onChange={(e) => set("agentName", e.target.value)} />
            </>
          )}
          {step === 7 && (
            <>
              <h1 className="text-2xl font-semibold">Ton</h1>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => set("tone", t)}
                    className={`rounded-xl border px-3 py-2 text-sm ${form.tone === t ? "border-teal-400 bg-teal-400/10" : "border-white/10"}`}
                  >
                    {toneLabel[t]}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 8 && (
            <>
              <h1 className="text-2xl font-semibold">Langues</h1>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((l) => {
                  const on = form.languages.includes(l.code);
                  return (
                    <button
                      type="button"
                      key={l.code}
                      onClick={() =>
                        set(
                          "languages",
                          on ? form.languages.filter((x) => x !== l.code) : [...form.languages, l.code],
                        )
                      }
                      className={`rounded-xl border px-3 py-2 text-sm ${on ? "border-teal-400 bg-teal-400/10" : "border-white/10"}`}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <div className="flex justify-between">
            <button type="button" className="btn btn-ghost" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
              Retour
            </button>
            {step < 8 ? (
              <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
                Continuer
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={finish}>
                Activer mon agent
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
