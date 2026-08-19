"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, Alert } from "@/components/ui";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme";

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
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4 p-8">
        <Logo />
        <h1 className="text-2xl">Se connecter</h1>
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" placeholder="vous@entreprise.com" />
        </Field>
        <Field label="Mot de passe">
          <input name="password" type="password" required autoComplete="current-password" />
        </Field>
        {error ? (
          <Alert tone="danger" title="Connexion impossible">
            {error}
          </Alert>
        ) : null}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
        <div className="flex justify-between text-sm text-[var(--muted)]">
          <Link href="/forgot-password">Mot de passe oublié</Link>
          <Link href="/register">Créer un compte</Link>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Démo : xena.w@example.org / Demo123!
        </p>
      </form>
    </div>
  );
}
