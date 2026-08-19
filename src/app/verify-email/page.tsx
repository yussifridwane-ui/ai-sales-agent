"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState("Vérification…");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setMsg("Vérifiez votre email. En mode DEMO sans SMTP, le lien s'affiche après l'inscription.");
      return;
    }
    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(async (r) => {
      if (r.ok) {
        setMsg("Email vérifié.");
        router.push("/onboarding");
      } else {
        const d = await r.json();
        setMsg(d.error || "Lien invalide.");
      }
    });
  }, [params, router]);

  return (
    <div className="card w-full max-w-md p-8 text-center">
      <h1 className="text-2xl font-semibold">Vérification email</h1>
      <p className="mt-3 text-slate-400">{msg}</p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <Inner />
      </Suspense>
    </div>
  );
}
