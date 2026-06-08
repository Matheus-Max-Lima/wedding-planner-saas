"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  Mail,
  Phone,
  ChevronDown,
  CheckSquare,
  Square,
  Download,
  Send,
  QrCode,
  Upload,
  Copy,
  Check,
  Link2,
} from "lucide-react";
import Papa from "papaparse";
import QRCode from "qrcode";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TableRef {
  id: string;
  name: string;
}

interface Guest {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  side: "bride" | "groom" | "both";
  status: "confirmed" | "pending" | "declined";
  plusOne: boolean;
  plusOneName?: string | null;
  dietary?: string | null;
  notes?: string | null;
  inviteSent: boolean;
  table?: TableRef | null;
}

type FilterStatus = "all" | "confirmed" | "pending" | "declined";
type FilterSide = "all" | "bride" | "groom" | "both";

interface CsvRow {
  name: string;
  email: string;
  phone: string;
  side: string;
  plusOne: boolean;
  _error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmado",
  pending: "Pendente",
  declined: "Recusado",
};

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  declined: "bg-red-100 text-red-600",
};

const SIDE_LABEL: Record<string, string> = {
  bride: "Noiva",
  groom: "Noivo",
  both: "Ambos",
};

const SIDE_STYLE: Record<string, string> = {
  bride: "bg-pink-100 text-pink-600",
  groom: "bg-blue-100 text-blue-600",
  both: "bg-purple-100 text-purple-600",
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  side: "both" as Guest["side"],
  status: "pending" as Guest["status"],
  plusOne: false,
  plusOneName: "",
  dietary: "",
  notes: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-4 items-center shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-2xl font-bold text-stone-800">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        STATUS_STYLE[status] || "bg-stone-100 text-stone-500"
      }`}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function SideBadge({ side }: { side: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        SIDE_STYLE[side] || "bg-stone-100 text-stone-500"
      }`}
    >
      {SIDE_LABEL[side] || side}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterSide, setFilterSide] = useState<FilterSide>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showBulk, setShowBulk] = useState(false);

  // CSV Import modal state
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvDone, setCsvDone] = useState<number | null>(null);
  const csvFileRef = useRef<HTMLInputElement>(null);

  // QR Code modal state
  const [qrGuest, setQrGuest] = useState<{ id: string; name: string; link: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/guests");
      const data = await res.json();
      setGuests(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const confirmed = guests.filter((g) => g.status === "confirmed").length;
  const pending = guests.filter((g) => g.status === "pending").length;
  const declined = guests.filter((g) => g.status === "declined").length;
  const totalWithPlusOne = guests.reduce((s, g) => s + 1 + (g.plusOne ? 1 : 0), 0);

  const filtered = useMemo(() => {
    return guests.filter((g) => {
      const matchSearch =
        !search ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.email?.toLowerCase().includes(search.toLowerCase()) ||
        g.phone?.includes(search);
      const matchStatus = filterStatus === "all" || g.status === filterStatus;
      const matchSide = filterSide === "all" || g.side === filterSide;
      return matchSearch && matchStatus && matchSide;
    });
  }, [guests, search, filterStatus, filterSide]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(g: Guest) {
    setEditingId(g.id);
    setForm({
      name: g.name,
      email: g.email || "",
      phone: g.phone || "",
      side: g.side,
      status: g.status,
      plusOne: g.plusOne,
      plusOneName: g.plusOneName || "",
      dietary: g.dietary || "",
      notes: g.notes || "",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveGuest(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        side: form.side,
        status: form.status,
        plusOne: form.plusOne,
        plusOneName: form.plusOne ? form.plusOneName || null : null,
        dietary: form.dietary || null,
        notes: form.notes || null,
      };

      if (editingId) {
        const res = await fetch(`/api/guests/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        setGuests((prev) => prev.map((g) => (g.id === editingId ? updated : g)));
      } else {
        const res = await fetch("/api/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        setGuests((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      }
      cancelForm();
    } finally {
      setSaving(false);
    }
  }

  async function deleteGuest(id: string) {
    await fetch(`/api/guests/${id}`, { method: "DELETE" });
    setGuests((prev) => prev.filter((g) => g.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDeleteConfirm(null);
  }

  async function markInviteSent(id: string) {
    const res = await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteSent: true }),
    });
    const updated = await res.json();
    setGuests((prev) => prev.map((g) => (g.id === id ? updated : g)));
  }

  async function applyBulkStatus() {
    if (!bulkStatus || selected.size === 0) return;
    const ids = Array.from(selected);
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/guests/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: bulkStatus }),
        })
      )
    );
    setGuests((prev) =>
      prev.map((g) => (selected.has(g.id) ? { ...g, status: bulkStatus as Guest["status"] } : g))
    );
    setSelected(new Set());
    setBulkStatus("");
    setShowBulk(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((g) => g.id)));
    }
  }

  function exportCSV() {
    const header = ["Nome", "Email", "Telefone", "Lado", "Status", "Acompanhante", "Restrição"];
    const rows = guests.map((g) => [
      g.name,
      g.email || "",
      g.phone || "",
      SIDE_LABEL[g.side],
      STATUS_LABEL[g.status],
      g.plusOne ? g.plusOneName || "Sim" : "Não",
      g.dietary || "",
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "convidados.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── CSV Import handlers ────────────────────────────────────────────────────

  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: true,
      complete(results) {
        const rows: CsvRow[] = [];
        const raw = results.data as string[][];
        // skip header row if first cell looks like a label
        const startIdx =
          raw.length > 0 && raw[0][0]?.toLowerCase().trim() === "nome" ? 1 : 0;
        for (let i = startIdx; i < raw.length; i++) {
          const [nome, email, telefone, lado, acomp] = raw[i];
          if (!nome?.trim()) continue;
          const sideMap: Record<string, string> = {
            noiva: "bride",
            bride: "bride",
            noivo: "groom",
            groom: "groom",
            ambos: "both",
            both: "both",
          };
          const side = sideMap[(lado || "").toLowerCase().trim()] || "both";
          const plusOne =
            (acomp || "").toLowerCase().trim() === "sim" ||
            (acomp || "").toLowerCase().trim() === "true";
          rows.push({ name: nome.trim(), email: email?.trim() || "", phone: telefone?.trim() || "", side, plusOne });
        }
        setCsvRows(rows);
        setCsvDone(null);
      },
    });
  }

  function downloadCsvTemplate() {
    const csv = "nome,email,telefone,lado,acompanhante\nAna Silva,ana@email.com,(11) 99999-9999,noiva,sim\nJoão Santos,joao@email.com,(21) 88888-8888,noivo,não";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-convidados.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function confirmCsvImport() {
    if (csvRows.length === 0) return;
    setCsvImporting(true);
    try {
      const res = await fetch("/api/guests/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guests: csvRows.map((r) => ({
            name: r.name,
            email: r.email || null,
            phone: r.phone || null,
            side: r.side,
            plusOne: r.plusOne,
          })),
        }),
      });
      const data = await res.json();
      setCsvDone(data.count ?? csvRows.length);
      await fetchGuests();
    } finally {
      setCsvImporting(false);
    }
  }

  function closeCsvModal() {
    setShowCsvModal(false);
    setCsvRows([]);
    setCsvDone(null);
    if (csvFileRef.current) csvFileRef.current.value = "";
  }

  // ── QR Code handlers ───────────────────────────────────────────────────────

  async function openQrModal(guest: Guest) {
    setQrLoading(true);
    setQrGuest(null);
    setQrDataUrl("");
    setQrCopied(false);
    try {
      const res = await fetch(`/api/guests/${guest.id}/rsvp-token`, { method: "POST" });
      const data = await res.json();
      const url: string = data.link;
      const dataUrl = await QRCode.toDataURL(url, { width: 280, margin: 2, color: { dark: "#292524", light: "#ffffff" } });
      setQrGuest({ id: guest.id, name: guest.name, link: url });
      setQrDataUrl(dataUrl);
    } finally {
      setQrLoading(false);
    }
  }

  function closeQrModal() {
    setQrGuest(null);
    setQrDataUrl("");
  }

  async function copyQrLink() {
    if (!qrGuest) return;
    await navigator.clipboard.writeText(qrGuest.link);
    setQrCopied(true);
    setTimeout(() => setQrCopied(false), 2000);
  }

  function downloadQr() {
    if (!qrDataUrl || !qrGuest) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qrcode-${qrGuest.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Carregando convidados…</p>
        </div>
      </div>
    );
  }

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <div className="min-h-screen bg-[#fdf8f5] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Convidados</h1>
            <p className="text-stone-400 text-sm mt-0.5">
              {totalWithPlusOne} pessoas no total (incluindo acompanhantes)
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowCsvModal(true)}
              className="flex items-center gap-2 border border-stone-200 text-stone-600 hover:bg-stone-50 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              <Upload className="w-4 h-4" />
              Importar CSV
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 border border-stone-200 text-stone-600 hover:bg-stone-50 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button
              onClick={startAdd}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar convidado
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total"
            value={guests.length}
            icon={Users}
            color="bg-rose-50 text-rose-600 border-rose-100"
          />
          <StatCard
            label="Confirmados"
            value={confirmed}
            icon={UserCheck}
            color="bg-emerald-50 text-emerald-600 border-emerald-100"
          />
          <StatCard
            label="Pendentes"
            value={pending}
            icon={Clock}
            color="bg-amber-50 text-amber-600 border-amber-100"
          />
          <StatCard
            label="Recusados"
            value={declined}
            icon={UserX}
            color="bg-red-50 text-red-600 border-red-100"
          />
        </div>


        {/* Add / Edit form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-md ring-2 ring-rose-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-stone-700">
                {editingId ? "Editar convidado" : "Novo convidado"}
              </h2>
              <button onClick={cancelForm} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveGuest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Nome completo *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                    placeholder="Nome do convidado"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Lado</label>
                  <select
                    value={form.side}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, side: e.target.value as Guest["side"] }))
                    }
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                  >
                    <option value="bride">Noiva</option>
                    <option value="groom">Noivo</option>
                    <option value="both">Ambos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as Guest["status"] }))
                    }
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="declined">Recusado</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => setForm((f) => ({ ...f, plusOne: !f.plusOne }))}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        form.plusOne
                          ? "bg-rose-500 border-rose-500"
                          : "border-stone-300 hover:border-rose-300"
                      }`}
                    >
                      {form.plusOne && (
                        <span className="text-white text-xs font-bold leading-none">✓</span>
                      )}
                    </div>
                    <span className="text-sm text-stone-600">Vem com acompanhante</span>
                  </label>
                </div>

                {form.plusOne && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-500 mb-1">
                      Nome do acompanhante
                    </label>
                    <input
                      value={form.plusOneName}
                      onChange={(e) => setForm((f) => ({ ...f, plusOneName: e.target.value }))}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                      placeholder="Nome do acompanhante"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Restrição alimentar
                  </label>
                  <input
                    value={form.dietary}
                    onChange={(e) => setForm((f) => ({ ...f, dietary: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                    placeholder="Vegetariano, sem glúten, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Observações
                  </label>
                  <input
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
                    placeholder="Notas adicionais"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2.5 text-sm text-stone-500 hover:text-stone-700 border border-stone-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-sm bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Salvando…" : editingId ? "Atualizar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters + search */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email ou telefone…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", "confirmed", "pending", "declined"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  filterStatus === s
                    ? "bg-rose-500 text-white"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}
              >
                {s === "all"
                  ? `Todos (${guests.length})`
                  : s === "confirmed"
                  ? `Confirmados (${confirmed})`
                  : s === "pending"
                  ? `Pendentes (${pending})`
                  : `Recusados (${declined})`}
              </button>
            ))}

            <div className="ml-auto">
              <select
                value={filterSide}
                onChange={(e) => setFilterSide(e.target.value as FilterSide)}
                className="text-xs border border-stone-200 rounded-xl px-3 py-1.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-300 text-stone-600"
              >
                <option value="all">Todos os lados</option>
                <option value="bride">Noiva</option>
                <option value="groom">Noivo</option>
                <option value="both">Ambos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-rose-700">
              {selected.size} selecionado{selected.size > 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setShowBulk((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-800 border border-rose-200 bg-white rounded-xl px-3 py-1.5"
            >
              Alterar status
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showBulk && (
              <div className="flex items-center gap-2">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="text-xs border border-stone-200 rounded-xl px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                  <option value="">Escolher status…</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="pending">Pendente</option>
                  <option value="declined">Recusado</option>
                </select>
                <button
                  onClick={applyBulkStatus}
                  disabled={!bulkStatus}
                  className="px-3 py-1.5 text-xs bg-rose-500 text-white rounded-xl hover:bg-rose-600 disabled:opacity-40 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            )}
            <button
              onClick={() => setSelected(new Set())}
              className="ml-auto text-xs text-stone-500 hover:text-stone-700"
            >
              Limpar seleção
            </button>
          </div>
        )}

        {/* Guest table */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-50 flex items-center justify-between">
            <h2 className="font-semibold text-stone-700">
              Lista de convidados{" "}
              <span className="text-rose-500 font-bold">{filtered.length}</span>
              {filtered.length !== guests.length && (
                <span className="text-stone-400 text-sm font-normal ml-1">
                  de {guests.length}
                </span>
              )}
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum convidado encontrado</p>
              <p className="text-sm mt-1">
                {search || filterStatus !== "all" || filterSide !== "all"
                  ? "Tente ajustar os filtros"
                  : 'Clique em "Adicionar convidado" para começar'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100">
                      <th className="px-4 py-3 text-left w-10">
                        <button
                          onClick={toggleSelectAll}
                          className="text-stone-400 hover:text-rose-500 transition-colors"
                        >
                          {allSelected ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">
                        Contato
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">
                        Lado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">
                        +1
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">
                        Mesa
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-stone-400 uppercase tracking-wide">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filtered.map((g) => (
                      <tr
                        key={g.id}
                        className={`hover:bg-stone-50/50 transition-colors ${
                          selected.has(g.id) ? "bg-rose-50/40" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleSelect(g.id)}
                            className="text-stone-400 hover:text-rose-500 transition-colors"
                          >
                            {selected.has(g.id) ? (
                              <CheckSquare className="w-4 h-4 text-rose-500" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-stone-800">{g.name}</div>
                          {g.dietary && (
                            <div className="text-xs text-stone-400 mt-0.5">{g.dietary}</div>
                          )}
                          {g.inviteSent && (
                            <div className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
                              <Send className="w-2.5 h-2.5" />
                              Convite enviado
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            {g.email && (
                              <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate max-w-[160px]">{g.email}</span>
                              </div>
                            )}
                            {g.phone && (
                              <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                {g.phone}
                              </div>
                            )}
                            {!g.email && !g.phone && (
                              <span className="text-stone-300 text-xs">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <SideBadge side={g.side} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={g.status} />
                        </td>
                        <td className="px-4 py-3">
                          {g.plusOne ? (
                            <div>
                              <span className="text-emerald-600 text-xs font-medium">Sim</span>
                              {g.plusOneName && (
                                <div className="text-xs text-stone-400">{g.plusOneName}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-stone-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {g.table ? (
                            <span className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded-lg">
                              {g.table.name}
                            </span>
                          ) : (
                            <span className="text-stone-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openQrModal(g)}
                              title="QR Code RSVP"
                              className="p-1.5 text-stone-400 hover:text-purple-500 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                            {!g.inviteSent && (
                              <button
                                onClick={() => markInviteSent(g.id)}
                                title="Marcar convite como enviado"
                                className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => startEdit(g)}
                              className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {deleteConfirm === g.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => deleteGuest(g.id)}
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 text-xs border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-100"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(g.id)}
                                className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-stone-50">
                {filtered.map((g) => (
                  <div
                    key={g.id}
                    className={`px-4 py-4 ${selected.has(g.id) ? "bg-rose-50/40" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleSelect(g.id)}
                        className="mt-0.5 text-stone-400 hover:text-rose-500 flex-shrink-0"
                      >
                        {selected.has(g.id) ? (
                          <CheckSquare className="w-4 h-4 text-rose-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-stone-800">{g.name}</span>
                          <StatusBadge status={g.status} />
                          <SideBadge side={g.side} />
                        </div>

                        <div className="mt-1.5 space-y-0.5">
                          {g.email && (
                            <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                              <Mail className="w-3 h-3" />
                              {g.email}
                            </div>
                          )}
                          {g.phone && (
                            <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                              <Phone className="w-3 h-3" />
                              {g.phone}
                            </div>
                          )}
                          {g.plusOne && (
                            <div className="text-xs text-emerald-600">
                              +1{g.plusOneName ? `: ${g.plusOneName}` : ""}
                            </div>
                          )}
                          {g.dietary && (
                            <div className="text-xs text-stone-400">{g.dietary}</div>
                          )}
                          {g.table && (
                            <div className="text-xs text-stone-500">Mesa: {g.table.name}</div>
                          )}
                          {g.inviteSent && (
                            <div className="text-xs text-blue-500 flex items-center gap-1">
                              <Send className="w-2.5 h-2.5" />
                              Convite enviado
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <button
                          onClick={() => openQrModal(g)}
                          className="p-1.5 text-stone-400 hover:text-purple-500 rounded-lg hover:bg-purple-50"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        {!g.inviteSent && (
                          <button
                            onClick={() => markInviteSent(g.id)}
                            className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(g)}
                          className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {deleteConfirm === g.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => deleteGuest(g.id)}
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg"
                            >
                              Deletar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs border border-stone-200 rounded-lg text-stone-500"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(g.id)}
                            className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── CSV Import Modal ──────────────────────────────────────────────── */}
      {showCsvModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeCsvModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
              <div>
                <h2 className="text-lg font-bold text-stone-800">Importar convidados via CSV</h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Colunas: nome, email, telefone, lado (noiva/noivo/ambos), acompanhante (sim/não)
                </p>
              </div>
              <button onClick={closeCsvModal} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* File + template */}
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  Escolher arquivo CSV
                  <input
                    ref={csvFileRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCsvFile}
                  />
                </label>
                <button
                  onClick={downloadCsvTemplate}
                  className="flex items-center gap-2 border border-stone-200 text-stone-600 hover:bg-stone-50 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Baixar modelo
                </button>
              </div>

              {/* Preview table */}
              {csvRows.length > 0 && !csvDone && (
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-2">
                    {csvRows.length} convidado{csvRows.length !== 1 ? "s" : ""} encontrado{csvRows.length !== 1 ? "s" : ""}
                  </p>
                  <div className="rounded-xl border border-stone-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-64">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-stone-50 border-b border-stone-100">
                            {["Nome", "Email", "Telefone", "Lado", "+1"].map((h) => (
                              <th key={h} className="px-3 py-2 text-left font-semibold text-stone-400 uppercase tracking-wide whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                          {csvRows.map((row, i) => (
                            <tr key={i} className="hover:bg-stone-50/50">
                              <td className="px-3 py-2 font-medium text-stone-800">{row.name}</td>
                              <td className="px-3 py-2 text-stone-500">{row.email || "—"}</td>
                              <td className="px-3 py-2 text-stone-500">{row.phone || "—"}</td>
                              <td className="px-3 py-2">
                                <SideBadge side={row.side} />
                              </td>
                              <td className="px-3 py-2">
                                {row.plusOne ? (
                                  <span className="text-emerald-600 font-medium">Sim</span>
                                ) : (
                                  <span className="text-stone-300">Não</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Success state */}
              {csvDone !== null && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-emerald-700 font-semibold">
                    {csvDone} convidado{csvDone !== 1 ? "s" : ""} importado{csvDone !== 1 ? "s" : ""} com sucesso!
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                onClick={closeCsvModal}
                className="px-4 py-2.5 text-sm text-stone-500 hover:text-stone-700 border border-stone-200 rounded-xl transition-colors"
              >
                {csvDone !== null ? "Fechar" : "Cancelar"}
              </button>
              {csvDone === null && (
                <button
                  onClick={confirmCsvImport}
                  disabled={csvRows.length === 0 || csvImporting}
                  className="px-5 py-2.5 text-sm bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {csvImporting
                    ? "Importando…"
                    : csvRows.length > 0
                    ? `Importar ${csvRows.length} convidado${csvRows.length !== 1 ? "s" : ""}`
                    : "Importar"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── QR Code Modal ─────────────────────────────────────────────────── */}
      {(qrGuest || qrLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget && !qrLoading) closeQrModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
              <div>
                <h2 className="text-lg font-bold text-stone-800">QR Code RSVP</h2>
                {qrGuest && (
                  <p className="text-xs text-stone-400 mt-0.5">{qrGuest.name}</p>
                )}
              </div>
              {!qrLoading && (
                <button onClick={closeQrModal} className="text-stone-400 hover:text-stone-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="px-6 py-6 flex flex-col items-center gap-5">
              {qrLoading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                  <p className="text-stone-400 text-sm">Gerando QR Code…</p>
                </div>
              ) : qrDataUrl ? (
                <>
                  {/* QR image */}
                  <div
                    className="rounded-2xl border-2 border-rose-100 p-3"
                    style={{ background: "#fff" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt={`QR Code — ${qrGuest?.name}`}
                      width={240}
                      height={240}
                      style={{ display: "block" }}
                    />
                  </div>

                  {/* Link preview */}
                  <div className="w-full bg-stone-50 rounded-xl px-3 py-2.5 flex items-center gap-2 min-w-0">
                    <Link2 className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                    <span className="text-xs text-stone-500 truncate flex-1">{qrGuest?.link}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex w-full gap-3">
                    <button
                      onClick={copyQrLink}
                      className="flex-1 flex items-center justify-center gap-2 border border-stone-200 hover:bg-stone-50 text-stone-600 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                    >
                      {qrCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar link
                        </>
                      )}
                    </button>
                    <button
                      onClick={downloadQr}
                      className="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Baixar PNG
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
