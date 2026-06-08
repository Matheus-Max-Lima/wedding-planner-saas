"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  link?: string | null;
  createdAt: string;
}

function typeIcon(type: Notification["type"]) {
  switch (type) {
    case "info":
      return "ℹ️";
    case "warning":
      return "⚠️";
    case "success":
      return "✅";
    case "error":
      return "❌";
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "agora mesmo";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `há ${days}d`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(
      unread.map((n) =>
        fetch(`/api/notifications/${n.id}`, { method: "PATCH" })
      )
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function remove(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "relative",
          padding: "8px",
          borderRadius: "50%",
          background: open ? "#fff1f2" : "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s",
        }}
        aria-label="Notificações"
      >
        <Bell
          style={{
            width: 20,
            height: 20,
            color: unreadCount > 0 ? "#f43f5e" : "#78716c",
          }}
        />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: "#f43f5e",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: 340,
            maxHeight: 480,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            border: "1px solid #fce7f3",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid #fce7f3",
              background: "#fdf8f5",
            }}
          >
            <span
              style={{ fontWeight: 700, color: "#1c1917", fontSize: 15 }}
            >
              Notificações
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    background: "#fce7f3",
                    color: "#f43f5e",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 999,
                    padding: "2px 7px",
                  }}
                >
                  {unreadCount} nova{unreadCount !== 1 ? "s" : ""}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: 12,
                  color: "#f43f5e",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "40px 16px",
                  textAlign: "center",
                  color: "#a8a29e",
                  fontSize: 14,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                Sem notificações por enquanto
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px 16px",
                    background: n.read ? "#fff" : "#fdf8f5",
                    borderBottom: "1px solid #f5f5f4",
                    cursor: n.link ? "pointer" : "default",
                    transition: "background 0.1s",
                  }}
                  onClick={() => {
                    if (n.link) window.location.href = n.link;
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                    {typeIcon(n.type)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: n.read ? 400 : 700,
                        color: "#1c1917",
                        fontSize: 13,
                        marginBottom: 2,
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        color: "#78716c",
                        fontSize: 12,
                        lineHeight: 1.4,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {n.message}
                    </div>
                    <div style={{ color: "#a8a29e", fontSize: 11, marginTop: 4 }}>
                      {relativeTime(n.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(n.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#d6d3d1",
                      fontSize: 16,
                      padding: 0,
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                    aria-label="Remover notificação"
                    title="Remover"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
