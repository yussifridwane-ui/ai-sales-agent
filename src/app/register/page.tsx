"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, Alert } from "@/components/ui";
import { Logo } from "@/components/logo";

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
    const token = data.demoVerifyPath ? new URL(data.demoVerifyPath, "http://x").searchParams.get("token") : "";
    router.push(`/verify-email?next=1${token ? `&token=${token}` : ""}`);
  }

  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4 p-8">
        <Logo />
        <h1 className="text-2xl">Commencer gratuitement</h1>
        <p className="text-sm text-[var(--muted)]">Votre agent en quelques minutes.</p>
        <Field label="Nom">
          <input name="name" required autoComplete="name" />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Mot de passe (8+ caractères)">
          <input name="password" type="password" minLength={8} required autoComplete="new-password" />
        </Field>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input name="marketing" type="checkbox" className="h-4 w-4" />
          Recevoir des emails produit (opt-in)
        </label>
        {error ? (
          <Alert tone="danger" title="Inscription impossible">
            {error}
          </Alert>
        ) : null}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Création…" : "Créer mon espace"}
        </button>
        <p className="text-sm text-[var(--muted)]">
          Déjà un compte ? <Link href="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
