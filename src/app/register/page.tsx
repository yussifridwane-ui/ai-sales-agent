"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        marketingConsent: fd.get("marketing") === "on",
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Inscription impossible.");
      return;
    }
    router.push(`/verify-email?next=1${data.demoVerifyPath ? `&token=${new URL(data.demoVerifyPath, "http://x").searchParams.get("token")}` : ""}`);
  }

  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4 p-8">
        <div>
          <div className="text-sm text-teal-300">Start Free</div>
          <h1 className="mt-1 text-2xl font-semibold">Créer un compte</h1>
          <p className="mt-1 text-sm text-slate-400">Peu d&apos;informations. Votre agent en quelques minutes.</p>
        </div>
        <Field label="Nom">
          <input name="name" required placeholder="Maya Chen" />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required />
        </Field>
        <Field label="Mot de passe (8+ caractères)">
          <input name="password" type="password" minLength={8} required />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input name="marketing" type="checkbox" className="h-4 w-4" />
          J&apos;accepte de recevoir des emails produit (opt-in)
        </label>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Création…" : "Créer mon espace"}
        </button>
        <p className="text-sm text-slate-400">
          Déjà un compte ? <Link href="/login">Connexion</Link>
        </p>
      </form>
    </div>
  );
}
