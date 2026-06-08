"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@noivasemcrise.com");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Email ou senha inválidos");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdf8f5, #fff0f2, #fffbeb)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem" }}>💍</span>
            <span style={{ fontWeight: 800, fontSize: "1.35rem", background: "linear-gradient(135deg, #f43f5e, #d4af37)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Noiva sem Crise
            </span>
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a2e", marginTop: "1.5rem" }}>Bem-vinda de volta!</h1>
          <p style={{ color: "#6b7280", marginTop: "0.25rem", fontSize: "0.9rem" }}>Entre na sua conta para continuar</p>
        </div>

        <div style={{ background: "white", borderRadius: "1.5rem", padding: "2rem", boxShadow: "0 20px 60px rgba(244,63,94,0.1)", border: "1px solid #fce7e7" }}>
          {error && (
            <div style={{ background: "#fff0f2", border: "1px solid #fecdd3", borderRadius: "0.75rem", padding: "0.75rem 1rem", marginBottom: "1.25rem", color: "#be123c", fontSize: "0.875rem" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ background: "#fdf8f5", borderRadius: "0.75rem", padding: "0.875rem 1rem", marginBottom: "1.25rem", border: "1px solid #fce7e7", fontSize: "0.82rem", color: "#6b7280" }}>
            <strong style={{ color: "#f43f5e" }}>Conta demo:</strong> demo@noivasemcrise.com / demo1234
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #fce7e7", borderRadius: "0.75rem", fontSize: "0.95rem", outline: "none", background: "#fdf8f5", boxSizing: "border-box" }}
                onFocus={e => (e.target.style.borderColor = "#f43f5e")}
                onBlur={e => (e.target.style.borderColor = "#fce7e7")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #fce7e7", borderRadius: "0.75rem", fontSize: "0.95rem", outline: "none", background: "#fdf8f5", boxSizing: "border-box" }}
                onFocus={e => (e.target.style.borderColor = "#f43f5e")}
                onBlur={e => (e.target.style.borderColor = "#fce7e7")}
              />
              <div style={{ textAlign: "right", marginTop: "0.375rem" }}>
                <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "#f43f5e", textDecoration: "none" }}>Esqueci minha senha</Link>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ background: "linear-gradient(135deg, #f43f5e, #fb7185)", color: "white", padding: "0.875rem", borderRadius: "0.75rem", border: "none", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: loading ? 0.7 : 1 }}>
              {loading && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
              {loading ? "Entrando..." : "Entrar 💍"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "#6b7280" }}>
            Não tem conta?{" "}
            <Link href="/register" style={{ color: "#f43f5e", fontWeight: 700, textDecoration: "none" }}>Cadastre-se grátis</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
