"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Heart, MapPin, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface WeddingInfo {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue?: string | null;
  city?: string | null;
}

interface GuestData {
  id: string;
  name: string;
  plusOne: boolean;
  plusOneName?: string | null;
  status: string;
  dietary?: string | null;
  rsvpRespondedAt?: string | null;
  wedding: WeddingInfo;
}

export default function RsvpPage() {
  const { token } = useParams<{ token: string }>();
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [choice, setChoice] = useState<"confirmed" | "declined" | "">("");
  const [dietary, setDietary] = useState("");
  const [plusOneName, setPlusOneName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: GuestData) => {
        setGuest(data);
        setDietary(data.dietary || "");
        setPlusOneName(data.plusOneName || "");
        if (data.rsvpRespondedAt) {
          setChoice(data.status as "confirmed" | "declined");
          setSubmitted(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!choice) {
      setError("Por favor, selecione confirmar ou recusar.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/rsvp/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: choice, dietary, plusOneName }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Erro ao enviar resposta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#fdf8f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2
          style={{ width: 36, height: 36, color: "#f43f5e", animation: "spin 1s linear infinite" }}
        />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#fdf8f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <XCircle style={{ width: 48, height: 48, color: "#f43f5e", margin: "0 auto 16px" }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#292524", marginBottom: 8 }}>
            Link não encontrado
          </h1>
          <p style={{ color: "#78716c", fontSize: 14 }}>
            Este link de confirmação é inválido ou já expirou.
          </p>
        </div>
      </div>
    );
  }

  if (!guest) return null;

  const w = guest.wedding;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fdf8f5 0%, #fff1f3 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 8px 40px rgba(244,63,94,0.10)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
            padding: "36px 32px 32px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
            <Heart style={{ width: 20, height: 20, color: "#ffd6dd", fill: "#ffd6dd" }} />
            <span style={{ color: "#ffd6dd", fontSize: 13, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Confirmação de Presença
            </span>
            <Heart style={{ width: 20, height: 20, color: "#ffd6dd", fill: "#ffd6dd" }} />
          </div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.2 }}>
            {w.brideName} &amp; {w.groomName}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: 0 }}>
            Você foi convidado para o casamento
          </p>
        </div>

        {/* Wedding info */}
        <div
          style={{
            background: "#fff9fb",
            borderBottom: "1px solid #fce7ed",
            padding: "20px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#78716c", fontSize: 14 }}>
            <Calendar style={{ width: 16, height: 16, color: "#f43f5e", flexShrink: 0 }} />
            <span style={{ color: "#292524", fontWeight: 500 }}>{formatDate(w.weddingDate)}</span>
          </div>
          {(w.venue || w.city) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#78716c", fontSize: 14 }}>
              <MapPin style={{ width: 16, height: 16, color: "#f43f5e", flexShrink: 0 }} />
              <span style={{ color: "#292524", fontWeight: 500 }}>
                {[w.venue, w.city].filter(Boolean).join(" — ")}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px" }}>
          <p style={{ fontSize: 16, color: "#292524", marginBottom: 24, fontWeight: 500 }}>
            Olá, <span style={{ color: "#f43f5e", fontWeight: 700 }}>{guest.name}</span>!
            <br />
            <span style={{ fontSize: 14, color: "#78716c", fontWeight: 400 }}>
              Por favor, confirme sua presença abaixo.
            </span>
          </p>

          {submitted ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
              }}
            >
              {choice === "confirmed" ? (
                <>
                  <CheckCircle
                    style={{ width: 56, height: 56, color: "#10b981", margin: "0 auto 16px" }}
                  />
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#292524", marginBottom: 8 }}>
                    Presença confirmada!
                  </h2>
                  <p style={{ color: "#78716c", fontSize: 14 }}>
                    Que alegria! Nos vemos no casamento.
                  </p>
                </>
              ) : (
                <>
                  <XCircle
                    style={{ width: 56, height: 56, color: "#f43f5e", margin: "0 auto 16px" }}
                  />
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#292524", marginBottom: 8 }}>
                    Presença recusada
                  </h2>
                  <p style={{ color: "#78716c", fontSize: 14 }}>
                    Sentiremos sua falta. Obrigado pela resposta.
                  </p>
                </>
              )}
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  marginTop: 20,
                  fontSize: 13,
                  color: "#f43f5e",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Alterar resposta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Confirm / Decline */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#57534e",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Sua resposta *
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setChoice("confirmed")}
                    style={{
                      flex: 1,
                      padding: "14px 12px",
                      borderRadius: 14,
                      border: `2px solid ${choice === "confirmed" ? "#10b981" : "#e7e5e4"}`,
                      background: choice === "confirmed" ? "#ecfdf5" : "#fafaf9",
                      color: choice === "confirmed" ? "#065f46" : "#78716c",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all 0.15s",
                    }}
                  >
                    <CheckCircle style={{ width: 18, height: 18 }} />
                    Confirmar presença
                  </button>
                  <button
                    type="button"
                    onClick={() => setChoice("declined")}
                    style={{
                      flex: 1,
                      padding: "14px 12px",
                      borderRadius: 14,
                      border: `2px solid ${choice === "declined" ? "#f43f5e" : "#e7e5e4"}`,
                      background: choice === "declined" ? "#fff1f3" : "#fafaf9",
                      color: choice === "declined" ? "#9f1239" : "#78716c",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all 0.15s",
                    }}
                  >
                    <XCircle style={{ width: 18, height: 18 }} />
                    Não poderei ir
                  </button>
                </div>
              </div>

              {/* Plus one name */}
              {guest.plusOne && choice === "confirmed" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#57534e",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Nome do acompanhante
                  </label>
                  <input
                    type="text"
                    value={plusOneName}
                    onChange={(e) => setPlusOneName(e.target.value)}
                    placeholder="Nome do seu acompanhante"
                    style={{
                      width: "100%",
                      border: "1.5px solid #e7e5e4",
                      borderRadius: 12,
                      padding: "12px 14px",
                      fontSize: 14,
                      color: "#292524",
                      background: "#fafaf9",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              {/* Dietary */}
              {choice === "confirmed" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#57534e",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Restrições alimentares
                  </label>
                  <input
                    type="text"
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    placeholder="Ex: vegetariano, sem glúten, alergia a frutos do mar…"
                    style={{
                      width: "100%",
                      border: "1.5px solid #e7e5e4",
                      borderRadius: 12,
                      padding: "12px 14px",
                      fontSize: 14,
                      color: "#292524",
                      background: "#fafaf9",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <p style={{ fontSize: 12, color: "#a8a29e", marginTop: 4 }}>
                    Deixe em branco se não houver restrições.
                  </p>
                </div>
              )}

              {error && (
                <p style={{ fontSize: 13, color: "#f43f5e", margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !choice}
                style={{
                  background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  padding: "15px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: submitting || !choice ? "not-allowed" : "pointer",
                  opacity: submitting || !choice ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "opacity 0.15s",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2
                      style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }}
                    />
                    Enviando…
                  </>
                ) : (
                  "Enviar resposta"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #fce7ed",
            padding: "16px 32px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 12, color: "#a8a29e", margin: 0 }}>
            Com amor,{" "}
            <span style={{ color: "#f43f5e", fontWeight: 600 }}>
              {w.brideName} &amp; {w.groomName}
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
