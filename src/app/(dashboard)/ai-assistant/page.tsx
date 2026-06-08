"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, Trash2, Copy, Check, X } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const MAX_CHARS = 500;
const MAX_HISTORY = 20;

const QUICK_ACTIONS = [
  {
    label: "Checklist completo",
    message: "Pode me sugerir um checklist completo para o casamento?",
    emoji: "✅",
    description: "Tarefas por mês",
  },
  {
    label: "Orçamento ideal",
    message: "Como calculo o orçamento ideal para o meu casamento?",
    emoji: "💰",
    description: "Distribuição de custos",
  },
  {
    label: "Escolher fornecedores",
    message: "Quais são as dicas para escolher fornecedores para o casamento?",
    emoji: "⭐",
    description: "Dicas e contratos",
  },
  {
    label: "Cronograma do dia",
    message: "Como deve ser o cronograma do dia do casamento?",
    emoji: "🕐",
    description: "Horários e logística",
  },
  {
    label: "Vestido de noiva",
    message: "Quais as dicas para escolher o vestido de noiva perfeito?",
    emoji: "👗",
    description: "Estilos e prazos",
  },
  {
    label: "Lua de mel",
    message: "Me ajude a planejar a lua de mel dos meus sonhos.",
    emoji: "✈️",
    description: "Destinos e dicas",
  },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-stone-100 text-stone-400 hover:text-stone-600 flex-shrink-0"
      title="Copiar mensagem"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyKey = weddingId ? `valentina-history-${weddingId}` : null;

  // Load history from localStorage on mount
  useEffect(() => {
    const welcome: Message = {
      id: "welcome",
      role: "ai",
      content:
        "Olá! Sou a Valentina, sua assistente de planejamento de casamento! 💍 Estou aqui para te ajudar com checklist, orçamento, fornecedores, cronograma e muito mais. O que você gostaria de saber?",
      timestamp: new Date(),
    };

    // Try to load weddingId first via a quick ping
    fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "__ping__" }),
    })
      .then((r) => r.json())
      .then((d) => {
        const id = d.weddingId as string | null;
        setWeddingId(id);
        if (id) {
          const key = `valentina-history-${id}`;
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const parsed: Array<{ id: string; role: "user" | "ai"; content: string; timestamp: string }> =
                JSON.parse(stored);
              const restored: Message[] = parsed.map((m) => ({
                ...m,
                timestamp: new Date(m.timestamp),
              }));
              setMessages(restored.length > 0 ? restored : [welcome]);
              return;
            } catch {
              // ignore parse errors
            }
          }
        }
        setMessages([welcome]);
      })
      .catch(() => setMessages([welcome]));
  }, []);

  // Save history whenever messages change
  useEffect(() => {
    if (!historyKey || messages.length === 0) return;
    const toSave = messages.slice(-MAX_HISTORY);
    localStorage.setItem(historyKey, JSON.stringify(toSave));
  }, [messages, historyKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading || isStreaming) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), stream: true }),
        });

        const contentType = res.headers.get("content-type") ?? "";

        if (res.ok && contentType.includes("text/event-stream")) {
          // Streaming path
          setLoading(false);
          setIsStreaming(true);
          setStreamingContent("");

          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let accumulated = "";
          let firstChunk = true;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              try {
                const parsed = JSON.parse(data);
                if (parsed.weddingId && firstChunk) {
                  setWeddingId(parsed.weddingId);
                  firstChunk = false;
                }
                if (parsed.delta) {
                  accumulated += parsed.delta;
                  setStreamingContent(accumulated);
                }
                if (parsed.done) {
                  const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "ai",
                    content: accumulated,
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, aiMsg]);
                  setStreamingContent("");
                  setIsStreaming(false);
                }
              } catch {
                // skip malformed
              }
            }
          }
          setIsStreaming(false);
          setStreamingContent("");
        } else if (res.ok) {
          // Non-streaming JSON path — show typing animation for 500ms then reveal
          const data = await res.json();
          if (data.weddingId) setWeddingId(data.weddingId);

          await new Promise((resolve) => setTimeout(resolve, 500));
          setLoading(false);

          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: data.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMsg]);
        } else {
          setLoading(false);
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "ai",
              content: "Desculpe, tive um problema para processar sua mensagem. Tente novamente!",
              timestamp: new Date(),
            },
          ]);
        }
      } catch {
        setLoading(false);
        setIsStreaming(false);
        setStreamingContent("");
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: "Erro de conexão. Verifique sua internet e tente novamente.",
            timestamp: new Date(),
          },
        ]);
      }

      inputRef.current?.focus();
    },
    [loading, isStreaming]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClearHistory = () => {
    const welcome: Message = {
      id: "welcome-" + Date.now(),
      role: "ai",
      content:
        "Conversa apagada! Pode começar do zero, estou aqui para te ajudar. 💍",
      timestamp: new Date(),
    };
    setMessages([welcome]);
    if (historyKey) localStorage.removeItem(historyKey);
  };

  const busy = loading || isStreaming;
  const charCount = input.length;
  const charOverLimit = charCount > MAX_CHARS;

  return (
    <div className="min-h-screen bg-[#fdf8f5] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-6 py-4 shadow-sm flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-rose-200 flex-shrink-0">
              💕
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">Valentina</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-stone-500">Assistente de casamento · Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-stone-200 hover:border-rose-200"
            title="Limpar conversa"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {msg.role === "ai" ? (
                  <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-base shadow-sm">
                    💕
                  </div>
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-stone-400 to-stone-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    V
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`flex flex-col gap-1 max-w-[80%] group ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.role === "ai" && (
                  <span className="text-xs text-stone-400 ml-1">Valentina</span>
                )}
                <div className="flex items-end gap-1">
                  {msg.role === "ai" && <CopyButton text={msg.content} />}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-rose-500 text-white rounded-tr-sm"
                        : "bg-white text-stone-800 border border-stone-100 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && <CopyButton text={msg.content} />}
                </div>
                <span
                  className={`text-xs text-stone-400 ${
                    msg.role === "user" ? "mr-1" : "ml-1"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {/* Streaming message bubble */}
          {isStreaming && streamingContent && (
            <div className="flex gap-3 flex-row">
              <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-base shadow-sm flex-shrink-0">
                💕
              </div>
              <div className="flex flex-col gap-1 max-w-[80%] items-start">
                <span className="text-xs text-stone-400 ml-1">Valentina</span>
                <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-sm leading-relaxed text-stone-800 whitespace-pre-wrap">
                  {streamingContent}
                  <span className="inline-block w-0.5 h-4 bg-rose-400 animate-pulse ml-0.5 align-middle" />
                </div>
              </div>
            </div>
          )}

          {/* Typing indicator (loading but no stream yet) */}
          {(loading || (isStreaming && !streamingContent)) && (
            <div className="flex gap-3 flex-row">
              <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-base shadow-sm flex-shrink-0">
                💕
              </div>
              <div className="flex flex-col gap-1 items-start">
                <span className="text-xs text-stone-400 ml-1">Valentina está digitando...</span>
                <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span
                      className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-t border-stone-100 px-4 pt-3 pb-1 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-stone-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Ações rápidas
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.message)}
                disabled={busy}
                className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 text-left"
              >
                <span className="text-lg flex-shrink-0">{action.emoji}</span>
                <span className="flex flex-col min-w-0">
                  <span className="font-semibold truncate">{action.label}</span>
                  <span className="text-rose-500 font-normal truncate">{action.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-stone-100 px-4 py-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS + 10))}
              placeholder="Pergunte algo sobre o seu casamento..."
              disabled={busy}
              maxLength={MAX_CHARS + 10}
              className={`w-full px-4 py-3 pr-16 border rounded-2xl text-sm focus:outline-none focus:ring-2 bg-stone-50 disabled:opacity-50 ${
                charOverLimit
                  ? "border-red-300 focus:ring-red-300"
                  : "border-stone-200 focus:ring-rose-300"
              }`}
            />
            <span
              className={`absolute right-3 bottom-3 text-xs ${
                charOverLimit ? "text-red-500 font-semibold" : "text-stone-400"
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || busy || charOverLimit}
            className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center hover:bg-rose-600 disabled:opacity-40 transition-colors shadow-lg shadow-rose-200 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
