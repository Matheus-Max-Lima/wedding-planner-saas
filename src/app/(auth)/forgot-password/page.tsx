"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdf8f5, #fff0f2)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem" }}>💍</span>
            <span style={{ fontWeight: 800, fontSize: "1.35rem", color: "#f43f5e" }}>Noiva sem Crise</span>
          </Link>
        </div>
        <div style={{ background: "white", borderRadius: "1.5rem", padding: "2rem", boxShadow: "0 20px 60px rgba(244,63,94,0.1)", border: "1px solid #fce7e7" }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📧</div>
              <h2 style={{ fontWeight: 800, color: "#1a1a2e", marginBottom: "0.75rem" }}>Email enviado!</h2>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Verifique sua caixa de entrada (e spam).</p>
              <Link href="/login" style={{ display: "inline-block", background: "linear-gradient(135deg, #f43f5e, #fb7185)", color: "white", padding: "0.75rem 2rem", borderRadius: "0.75rem", textDecoration: "none", fontWeight: 700 }}>Voltar ao login</Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a2e", textAlign: "center", marginBottom: "0.5rem" }}>Recuperar senha</h1>
              <p style={{ color: "#6b7280", textAlign: "center", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Enviaremos as instruções para o seu email</p>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com"
                    style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #fce7e7", borderRadius: "0.75rem", fontSize: "0.95rem", outline: "none", background: "#fdf8f5", boxSizing: "border-box" }} />
                </div>
                <button type="submit" disabled={loading}
                  style={{ background: "linear-gradient(135deg, #f43f5e, #fb7185)", color: "white", padding: "0.875rem", borderRadius: "0.75rem", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  {loading && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
                  {loading ? "Enviando..." : "Enviar instruções"}
                </button>
              </form>
              <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem" }}>
                <Link href="/login" style={{ color: "#f43f5e", textDecoration: "none" }}>← Voltar ao login</Link>
              </p>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
