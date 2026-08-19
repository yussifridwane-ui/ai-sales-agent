"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Connexion impossible.");
      return;
    }
    router.push(data.onboardingRequired ? "/onboarding" : "/app/dashboard");
  }

  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4 p-8">
        <div>
          <div className="text-sm text-teal-300">AI Sales Agent</div>
          <h1 className="mt-1 text-2xl font-semibold">Connexion</h1>
        </div>
        <Field label="Email">
          <input name="email" type="email" required placeholder="vous@entreprise.com" />
        </Field>
        <Field label="Mot de passe">
          <input name="password" type="password" required />
        </Field>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
        <div className="flex justify-between text-sm text-slate-400">
          <Link href="/forgot-password">Mot de passe oublié</Link>
          <Link href="/register">Créer un compte</Link>
        </div>
        <p className="text-xs text-slate-500">
          Démo : xena.w@example.org / Demo123! · Admin : nina.v@example.com / Admin123!
        </p>
        <p className="text-xs text-slate-600">Google, Apple, Microsoft : prévu (non connecté).</p>
      </form>
    </div>
  );
}
