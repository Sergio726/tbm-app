"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Plus, CheckCircle2, Archive, Loader2, Filter } from "lucide-react";
import type { ParkingLotItem, ParkingSource, ParkingStatus } from "@/types/database";

const SOURCE_LABEL: Record<ParkingSource, string> = {
  war_up: "War Up",
  "5_grandes": "Los 5 Grandes",
  manual: "Manual",
};

const SOURCE_COLOR: Record<ParkingSource, string> = {
  war_up: "#5b8aff",
  "5_grandes": "#818cf8",
  manual: "#94a3b8",
};

const STATUS_LABEL: Record<ParkingStatus, string> = {
  parked: "Aparcado",
  promoted: "Promovido a Roca",
  discarded: "Descartado",
};

interface Props {
  companyId: string;
  userId: string;
  isArquitecto: boolean;
  items: ParkingLotItem[];
  nameMap: Record<string, string | null>;
}

export default function ParkingLotClient({
  companyId,
  userId,
  isArquitecto,
  items,
  nameMap,
}: Props) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filterSource, setFilterSource] = useState<"all" | ParkingSource>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | ParkingStatus>("parked");

  // Form nuevo ítem manual
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newRationale, setNewRationale] = useState("");
  const [newRock, setNewRock] = useState("");

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (filterSource !== "all" && it.source !== filterSource) return false;
      if (filterStatus !== "all" && it.status !== filterStatus) return false;
      return true;
    });
  }, [items, filterSource, filterStatus]);

  const countByStatus = useMemo(() => {
    const c: Record<ParkingStatus, number> = {
      parked: 0,
      promoted: 0,
      discarded: 0,
    };
    items.forEach((i) => {
      const s = i.status as ParkingStatus;
      if (c[s] !== undefined) c[s]++;
    });
    return c;
  }, [items]);

  const addManual = () => {
    if (!newTitle.trim()) return;
    setError(null);
    startTransition(async () => {
      const { error: err } = await supabase.from("parking_lot").insert({
        company_id: companyId,
        source: "manual",
        proposed_by: userId,
        title: newTitle.trim(),
        rationale: newRationale.trim() || null,
        rock_label: newRock.trim() || null,
      });
      if (err) {
        setError(err.message);
        return;
      }
      setNewTitle("");
      setNewRationale("");
      setNewRock("");
      setShowForm(false);
      router.refresh();
    });
  };

  const setStatus = async (id: string, status: ParkingStatus) => {
    if (!isArquitecto) return;
    setError(null);
    setBusyId(id);
    try {
      const { error: err } = await supabase
        .from("parking_lot")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId,
        })
        .eq("id", id);
      if (err) {
        setError(err.message);
      } else {
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <StatBox label="Aparcados" value={countByStatus.parked} color="#cbd5e1" />
        <StatBox label="Promovidos" value={countByStatus.promoted} color="#34d399" />
        <StatBox label="Descartados" value={countByStatus.discarded} color="#94a3b8" />
      </div>

      {/* Filtros + Add */}
      <div
        className="flex items-center"
        style={{ gap: 10, marginBottom: 16, flexWrap: "wrap" }}
      >
        <div className="flex items-center" style={{ gap: 6 }}>
          <Filter size={13} color="rgba(255,255,255,0.5)" />
          <FilterChip
            active={filterSource === "all"}
            onClick={() => setFilterSource("all")}
          >
            Todos
          </FilterChip>
          <FilterChip
            active={filterSource === "war_up"}
            onClick={() => setFilterSource("war_up")}
            color="#5b8aff"
          >
            War Up
          </FilterChip>
          <FilterChip
            active={filterSource === "5_grandes"}
            onClick={() => setFilterSource("5_grandes")}
            color="#818cf8"
          >
            5 Grandes
          </FilterChip>
          <FilterChip
            active={filterSource === "manual"}
            onClick={() => setFilterSource("manual")}
            color="#94a3b8"
          >
            Manual
          </FilterChip>
        </div>

        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.08)" }} />

        <div className="flex items-center" style={{ gap: 6 }}>
          <StatusChip
            active={filterStatus === "parked"}
            onClick={() => setFilterStatus("parked")}
          >
            Aparcados
          </StatusChip>
          <StatusChip
            active={filterStatus === "promoted"}
            onClick={() => setFilterStatus("promoted")}
          >
            Promovidos
          </StatusChip>
          <StatusChip
            active={filterStatus === "discarded"}
            onClick={() => setFilterStatus("discarded")}
          >
            Descartados
          </StatusChip>
          <StatusChip
            active={filterStatus === "all"}
            onClick={() => setFilterStatus("all")}
          >
            Todos
          </StatusChip>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center"
          style={{
            marginLeft: "auto",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 999,
            background: showForm
              ? "rgba(255,255,255,0.06)"
              : "linear-gradient(135deg, rgba(91,138,255,0.18), rgba(91,138,255,0.06))",
            border: showForm
              ? "1px solid rgba(255,255,255,0.10)"
              : "1px solid rgba(91,138,255,0.28)",
            color: showForm ? "rgba(255,255,255,0.7)" : "#bcd0ff",
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Plus size={13} />
          {showForm ? "Cancelar" : "Aparcar nueva idea"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          style={{
            padding: "16px 18px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 18,
          }}
        >
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Idea o acción a aparcar"
            style={INPUT_STYLE}
          />
          <input
            value={newRock}
            onChange={(e) => setNewRock(e.target.value)}
            placeholder="Roca a la que podría apuntar (opcional)"
            style={{ ...INPUT_STYLE, marginTop: 8 }}
          />
          <textarea
            value={newRationale}
            onChange={(e) => setNewRationale(e.target.value)}
            placeholder="Contexto, por qué surgió (opcional)"
            rows={2}
            style={{ ...INPUT_STYLE, marginTop: 8, resize: "vertical" }}
          />
          <div className="flex items-center justify-end" style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={addManual}
              disabled={isPending || !newTitle.trim()}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                background: newTitle.trim()
                  ? "linear-gradient(135deg, #5b8aff, #2c5fe6)"
                  : "rgba(255,255,255,0.06)",
                color: newTitle.trim() ? "#fff" : "rgba(255,255,255,0.5)",
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: isPending || !newTitle.trim() ? "not-allowed" : "pointer",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? "Aparcando…" : "Aparcar"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(248,113,113,0.10)",
            border: "1px solid rgba(248,113,113,0.30)",
            color: "#fca5a5",
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: "20px 24px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.025)",
            border: "1px dashed rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.5)",
            fontSize: 13.5,
            textAlign: "center",
          }}
        >
          Sin ítems con estos filtros.
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: 10 }}>
          {filtered.map((it) => (
            <div
              key={it.id}
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
                opacity: it.status !== "parked" ? 0.6 : 1,
              }}
            >
              <div className="flex items-start justify-between" style={{ gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="flex items-center"
                    style={{ gap: 8, marginBottom: 4 }}
                  >
                    <span
                      style={{
                        fontSize: 10.5,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: `${SOURCE_COLOR[it.source as ParkingSource]}1f`,
                        color: SOURCE_COLOR[it.source as ParkingSource],
                        border: `1px solid ${SOURCE_COLOR[it.source as ParkingSource]}33`,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      {SOURCE_LABEL[it.source as ParkingSource] ?? it.source}
                    </span>
                    {it.status !== "parked" && (
                      <span
                        style={{
                          fontSize: 10.5,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.6)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                        }}
                      >
                        {STATUS_LABEL[it.status as ParkingStatus]}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>
                    {it.title}
                  </div>
                  {it.rationale && (
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "rgba(255,255,255,0.6)",
                        marginTop: 4,
                        lineHeight: 1.5,
                      }}
                    >
                      {it.rationale}
                    </div>
                  )}
                  {it.rock_label && (
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "rgba(165,180,252,0.85)",
                        marginTop: 4,
                      }}
                    >
                      Roca propuesta: {it.rock_label}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.62)",
                      marginTop: 6,
                    }}
                  >
                    {it.proposed_by && nameMap[it.proposed_by]
                      ? `${nameMap[it.proposed_by]} · `
                      : ""}
                    {it.created_at
                      ? new Date(it.created_at).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                        })
                      : ""}
                  </div>
                </div>

                {isArquitecto && it.status === "parked" && (
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <ActionButton
                      onClick={() => setStatus(it.id, "promoted")}
                      busy={busyId === it.id}
                      color="#34d399"
                      title="Promover a Roca"
                    >
                      <CheckCircle2 size={13} />
                      Promover
                    </ActionButton>
                    <ActionButton
                      onClick={() => setStatus(it.id, "discarded")}
                      busy={busyId === it.id}
                      color="#94a3b8"
                      title="Descartar"
                    >
                      <Archive size={13} />
                      Descartar
                    </ActionButton>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  color: "#fff",
  padding: "10px 14px",
  fontSize: 13.5,
  fontFamily: "inherit",
  outline: "none",
};

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.55)",
          textTransform: "uppercase",
          letterSpacing: 1.2,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  color = "#bcd0ff",
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "5px 11px",
        borderRadius: 999,
        fontSize: 11.5,
        background: active ? `${color}1f` : "rgba(255,255,255,0.03)",
        border: active ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.07)",
        color: active ? color : "rgba(255,255,255,0.6)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function StatusChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "5px 11px",
        borderRadius: 999,
        fontSize: 11.5,
        background: active
          ? "rgba(255,255,255,0.10)"
          : "rgba(255,255,255,0.03)",
        border: active
          ? "1px solid rgba(255,255,255,0.20)"
          : "1px solid rgba(255,255,255,0.07)",
        color: active ? "#fff" : "rgba(255,255,255,0.6)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function ActionButton({
  onClick,
  busy,
  color,
  title,
  children,
}: {
  onClick: () => void;
  busy: boolean;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={title}
      className="flex items-center"
      style={{
        gap: 5,
        padding: "5px 10px",
        borderRadius: 999,
        background: `${color}14`,
        border: `1px solid ${color}40`,
        color,
        fontSize: 11.5,
        fontWeight: 500,
        cursor: busy ? "not-allowed" : "pointer",
        opacity: busy ? 0.6 : 1,
      }}
    >
      {busy ? <Loader2 size={11} className="animate-spin" /> : null}
      {children}
    </button>
  );
}
