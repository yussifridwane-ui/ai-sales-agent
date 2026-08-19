"use client";

import { useState } from "react";

export default function AdminMfa() {
  const [secret, setSecret] = useState("");
  const [otpauth, setOtpauth] = useState("");
  const [msg, setMsg] = useState("");

  async function enroll() {
    const d = await fetch("/api/auth/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enroll" }),
    }).then((r) => r.json());
    setSecret(d.secret || "");
    setOtpauth(d.otpauth || "");
  }

  async function confirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const d = await fetch("/api/auth/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm", code: fd.get("code") }),
    }).then((r) => r.json());
    setMsg(d.ok ? "MFA activé." : d.error || "Erreur");
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">MFA administrateur</h1>
      <p className="text-sm text-slate-400">Obligatoire en production. Ajoutez le secret dans une app TOTP.</p>
      <button className="btn btn-primary" onClick={enroll}>
        Générer un secret
      </button>
      {secret ? (
        <div className="card p-4 text-sm">
          <div className="text-slate-400">Secret (affiché une fois)</div>
          <code className="mt-2 block break-all text-teal-200">{secret}</code>
          <div className="mt-2 text-xs text-slate-500">{otpauth}</div>
        </div>
      ) : null}
      <form onSubmit={confirm} className="card space-y-3 p-4">
        <input name="code" placeholder="Code à 6 chiffres" required />
        <button className="btn btn-primary">Confirmer</button>
      </form>
      {msg ? <p className="text-teal-300">{msg}</p> : null}
    </div>
  );
}
