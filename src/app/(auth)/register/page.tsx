"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", partnerName: "", weddingDate: "" });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("As senhas não coincidem"); return; }
    if (form.password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao criar conta"); setLoading(false); return; }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdf8f5, #fff0f2, #fffbeb)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem" }}>💍</span>
            <span style={{ fontWeight: 800, fontSize: "1.35rem", background: "linear-gradient(135deg, #f43f5e, #d4af37)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Noiva sem Crise
            </span>
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a2e", marginTop: "1.5rem" }}>Crie sua conta</h1>
          <p style={{ color: "#6b7280", marginTop: "0.25rem", fontSize: "0.9rem" }}>Comece a planejar o casamento dos seus sonhos</p>
        </div>

        <div style={{ background: "white", borderRadius: "1.5rem", padding: "2rem", boxShadow: "0 20px 60px rgba(244,63,94,0.1)", border: "1px solid #fce7e7" }}>
          {error && <div style={{ background: "#fff0f2", border: "1px solid #fecdd3", borderRadius: "0.75rem", padding: "0.75rem 1rem", marginBottom: "1.25rem", color: "#be123c", fontSize: "0.875rem" }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Seu nome completo *", key: "name", type: "text", placeholder: "Maria Silva" },
              { label: "Nome do(a) noivo(a)", key: "partnerName", type: "text", placeholder: "João Silva" },
              { label: "Data do casamento", key: "weddingDate", type: "date", placeholder: "" },
              { label: "Email *", key: "email", type: "email", placeholder: "seu@email.com" },
              { label: "Senha * (mín. 6 caracteres)", key: "password", type: "password", placeholder: "••••••••" },
              { label: "Confirmar senha *", key: "confirmPassword", type: "password", placeholder: "••••••••" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required={["name", "email", "password", "confirmPassword"].includes(f.key)}
                  style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #fce7e7", borderRadius: "0.75rem", fontSize: "0.9rem", outline: "none", background: "#fdf8f5", boxSizing: "border-box" }}
                  onFocus={e => (e.target.style.borderColor = "#f43f5e")}
                  onBlur={e => (e.target.style.borderColor = "#fce7e7")}
                />
              </div>
            ))}
            <button type="submit" disabled={loading}
              style={{ background: "linear-gradient(135deg, #f43f5e, #fb7185)", color: "white", padding: "0.875rem", borderRadius: "0.75rem", border: "none", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "0.5rem", opacity: loading ? 0.7 : 1 }}>
              {loading && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
              {loading ? "Criando conta..." : "Criar conta grátis 💍"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "#6b7280" }}>
            Já tem conta?{" "}
            <Link href="/login" style={{ color: "#f43f5e", fontWeight: 700, textDecoration: "none" }}>Entrar</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
