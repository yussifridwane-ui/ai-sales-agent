"use client";

import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui";

export default function ForgotPage() {
  const [msg, setMsg] = useState("");
  const [demo, setDemo] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email") }),
    });
    const data = await res.json();
    setMsg(data.message || "Si un compte existe, un email a été envoyé.");
    if (data.demoResetPath) setDemo(data.demoResetPath);
  }

  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-semibold">Mot de passe oublié</h1>
        <Field label="Email">
          <input name="email" type="email" required />
        </Field>
        <button className="btn btn-primary w-full">Envoyer le lien</button>
        {msg ? <p className="text-sm text-slate-400">{msg}</p> : null}
        {demo ? (
          <p className="text-sm text-amber-200">
            Mode email DEMO — lien : <Link href={demo}>{demo}</Link>
          </p>
        ) : null}
        <Link href="/login" className="text-sm text-slate-400">
          Retour
        </Link>
      </form>
    </div>
  );
}
