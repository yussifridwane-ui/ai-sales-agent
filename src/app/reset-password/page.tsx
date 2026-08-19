"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Field } from "@/components/ui";

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: params.get("token"), password: fd.get("password") }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Lien invalide.");
      return;
    }
    router.push("/login");
  }

  return (
    <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Nouveau mot de passe</h1>
      <Field label="Mot de passe">
        <input name="password" type="password" minLength={8} required />
      </Field>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <button className="btn btn-primary w-full">Réinitialiser</button>
    </form>
  );
}

export default function ResetPage() {
  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <Inner />
      </Suspense>
    </div>
  );
}
