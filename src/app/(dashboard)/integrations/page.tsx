"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface IntegrationStatus {
  spotify: boolean;
  googleCalendar: boolean;
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/integrations/status");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      toast.error("Erro ao carregar status das integrações");
    }
    setLoading(false);
  }

  const integrations = [
    {
      key: "spotify" as const,
      name: "Spotify",
      description: "Importe suas playlists do Spotify diretamente para os momentos do seu casamento.",
      icon: "🎵",
      color: "#1DB954",
      connectHref: "/api/integrations/spotify/connect",
      actionLabel: "Ver Músicas",
      actionHref: "/music",
      available: true,
    },
    {
      key: "googleCalendar" as const,
      name: "Google Agenda",
      description: "Sincronize o cronograma do casamento com seu Google Agenda automaticamente.",
      icon: "📅",
      color: "#4285F4",
      connectHref: "/api/integrations/google-calendar/connect",
      actionLabel: "Ver Cronograma",
      actionHref: "/timeline",
      available: true,
    },
    {
      key: null,
      name: "Stripe",
      description: "Aceite pagamentos e contribuições para os presentes do seu casamento.",
      icon: "💳",
      color: "#635BFF",
      connectHref: null,
      actionLabel: null,
      actionHref: null,
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            🔌 Integrações
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Conecte serviços externos para potencializar o planejamento do seu casamento
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {integrations.map((integration) => {
              const connected = integration.key ? status?.[integration.key] ?? false : false;

              return (
                <div
                  key={integration.name}
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: `${integration.color}15` }}
                    >
                      {integration.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-semibold text-stone-800">{integration.name}</h2>
                        {integration.available ? (
                          connected ? (
                            <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full font-medium">
                              ✅ Conectado
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 bg-stone-50 text-stone-500 border border-stone-200 rounded-full font-medium">
                              Não conectado
                            </span>
                          )
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full font-medium">
                            Em breve
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-500">{integration.description}</p>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      {integration.available ? (
                        connected ? (
                          <a
                            href={integration.actionHref!}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                          >
                            {integration.actionLabel}
                          </a>
                        ) : (
                          <a
                            href={integration.connectHref!}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                            style={{ backgroundColor: integration.color }}
                          >
                            Conectar
                          </a>
                        )
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-stone-100 text-stone-400 cursor-not-allowed"
                        >
                          Indisponível
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info box */}
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-sm text-stone-600">
          <p className="font-medium text-stone-700 mb-1">⚙️ Configuração necessária</p>
          <p>
            As integrações requerem variáveis de ambiente configuradas no servidor (
            <code className="bg-white px-1 py-0.5 rounded text-xs">SPOTIFY_CLIENT_ID</code>,{" "}
            <code className="bg-white px-1 py-0.5 rounded text-xs">GOOGLE_CALENDAR_CLIENT_ID</code>, etc.).
            Caso os botões de conectar não apareçam, verifique as configurações de ambiente.
          </p>
        </div>
      </div>
    </div>
  );
}
