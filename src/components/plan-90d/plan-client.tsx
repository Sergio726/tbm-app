"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Target } from "lucide-react";
import type {
  Profile,
  Rock,
  LeadingIndicator,
  IdeaParking,
  Decision,
  ProcessAsset,
} from "@/types/database";
import { createBrowserClient } from "@/lib/supabase/client";
import { isoDate } from "@/lib/dates";
import { RocksPanel } from "./rocks-panel";
import { BosPanel } from "./bos-panel";
import { MatrixPanel } from "./matrix-panel";
import { IdeasPanel } from "./ideas-panel";
import { DecisionsPanel } from "./decisions-panel";
import { ActivosPanel } from "./activos-panel";
import type { ActivoFormData } from "./activo-form";

type Tab = "rocks" | "bos" | "matrix" | "ideas" | "decisions" | "activos";

const TABS: { key: Tab; label: string }[] = [
  { key: "rocks", label: "Plan 90D" },
  { key: "bos", label: "BOS Dashboard" },
  { key: "matrix", label: "Clasificador" },
  { key: "ideas", label: "Ideas" },
  { key: "decisions", label: "Decisiones" },
  { key: "activos", label: "Activos" },
];

interface PlanClientProps {
  currentProfile: Profile;
  initialRocks: Rock[];
  initialIndicators: LeadingIndicator[];
  weekDate: string;
  initialIdeas: IdeaParking[];
  initialDecisions: Decision[];
  initialAssets: ProcessAsset[];
  team: Pick<Profile, "id" | "full_name" | "cargo" | "disc_letters">[];
}

export function PlanClient({
  currentProfile,
  initialRocks,
  initialIndicators,
  weekDate,
  initialIdeas,
  initialDecisions,
  initialAssets,
  team,
}: PlanClientProps) {
  const [tab, setTab] = useState<Tab>("rocks");
  const [rocks, setRocks] = useState<Rock[]>(initialRocks);
  const [indicators, setIndicators] = useState<LeadingIndicator[]>(initialIndicators);
  const [ideas, setIdeas] = useState<IdeaParking[]>(initialIdeas);
  const [decisions, setDecisions] = useState<Decision[]>(initialDecisions);
  const [assets, setAssets] = useState<ProcessAsset[]>(initialAssets);
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(successTimerRef.current);
      clearTimeout(errorTimerRef.current);
    },
    []
  );

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg(null);
    clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccessMsg(null), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg(null);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMsg(null), 4000);
  };

  const companyId = currentProfile.company_id!;
  const userId = currentProfile.id;

  // --- ROCKS ---
  const handleCreateRock = (data: {
    title: string;
    owner_id: string;
    success_criteria: string;
    start_date: string;
    end_date: string;
  }) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const { data: row, error } = await supabase
          .from("rocks")
          .insert({ ...data, company_id: companyId })
          .select()
          .single();
        if (error) {
          showError("Error al crear la Roca.");
        } else if (row) {
          setRocks((prev) => [row as Rock, ...prev]);
          showSuccess("Roca creada");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  const handleUpdateProgress = (rockId: string, progress: number, note: string) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const [updateRes, rockRes] = await Promise.all([
          supabase.from("rock_updates").insert({
            rock_id: rockId,
            user_id: userId,
            note: note || null,
            progress_at: progress,
          }),
          supabase.from("rocks").update({ progress }).eq("id", rockId).select().single(),
        ]);
        if (updateRes.error || rockRes.error) {
          showError("Error al actualizar el avance.");
        } else if (rockRes.data) {
          setRocks((prev) => prev.map((r) => (r.id === rockId ? (rockRes.data as Rock) : r)));
          showSuccess("Avance actualizado");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  const handleUpdateRockStatus = (rockId: string, status: string) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const { data: row, error } = await supabase
          .from("rocks")
          .update({ status })
          .eq("id", rockId)
          .select()
          .single();
        if (error) {
          showError("Error al actualizar el estado.");
        } else if (row) {
          setRocks((prev) => prev.map((r) => (r.id === rockId ? (row as Rock) : r)));
          showSuccess("Estado actualizado");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  const handlePromoteToRock = (title: string) => {
    const today = isoDate();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);
    handleCreateRock({
      title,
      owner_id: userId,
      success_criteria: "",
      start_date: today,
      end_date: isoDate(endDate),
    });
    setTab("rocks");
  };

  // --- INDICATORS ---
  const handleCreateIndicator = (data: { name: string; owner_id: string; weekly_target: number }) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const { data: row, error } = await supabase
          .from("leading_indicators")
          .insert({
            ...data,
            company_id: companyId,
            week_date: weekDate,
          })
          .select()
          .single();
        if (error) {
          showError("Error al crear el indicador.");
        } else if (row) {
          setIndicators((prev) => [...prev, row as LeadingIndicator]);
          showSuccess("Indicador creado");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  const handleUpdateIndicatorValue = (id: string, value: number) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const { data: row, error } = await supabase
          .from("leading_indicators")
          .update({ current_value: value })
          .eq("id", id)
          .select()
          .single();
        if (error) {
          showError("Error al actualizar el valor.");
        } else if (row) {
          setIndicators((prev) =>
            prev.map((ind) => (ind.id === id ? (row as LeadingIndicator) : ind))
          );
          showSuccess("Valor actualizado");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  // --- IDEAS ---
  const handleCreateIdea = (data: { idea: string; rationale: string; review_at: string }) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const { data: row, error } = await supabase
          .from("idea_parking")
          .insert({
            ...data,
            company_id: companyId,
            proposed_by: userId,
          })
          .select()
          .single();
        if (error) {
          showError("Error al parkear la idea.");
        } else if (row) {
          setIdeas((prev) => [row as IdeaParking, ...prev]);
          showSuccess("Idea parkeada — revisión en 91 días");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  const handleIdeaStatus = (id: string, status: "promoted" | "discarded") => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const { error } = await supabase
          .from("idea_parking")
          .update({ status })
          .eq("id", id);
        if (error) {
          showError("Error al actualizar la idea.");
        } else {
          setIdeas((prev) =>
            prev.map((i) => (i.id === id ? { ...i, status } : i))
          );
          showSuccess(status === "promoted" ? "Idea promovida a Roca" : "Idea descartada");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  // --- DECISIONS ---
  const handleCreateDecision = (data: {
    decision_text: string;
    info_available: number;
    applied_70_rule: boolean;
    disagree_and_commit: boolean;
    disagree_with: string;
  }) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const { data: row, error } = await supabase
          .from("decisions")
          .insert({
            ...data,
            disagree_with: data.disagree_with || null,
            company_id: companyId,
            user_id: userId,
          })
          .select()
          .single();
        if (error) {
          showError("Error al registrar la decisión.");
        } else if (row) {
          setDecisions((prev) => [row as Decision, ...prev]);
          showSuccess("Decisión registrada");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  // --- ACTIVOS DEL SISTEMA ---
  const handleCreateAsset = (data: ActivoFormData) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const { data: row, error } = await supabase
          .from("process_assets")
          .insert({
            title: data.title,
            description: data.description || null,
            category: data.category,
            video_url: data.video_url || null,
            doc_url: data.doc_url || null,
            owner_id: data.owner_id,
            company_id: companyId,
            created_by: userId,
          })
          .select()
          .single();
        if (error) {
          showError("Error al guardar el activo.");
        } else if (row) {
          setAssets((prev) => [row as ProcessAsset, ...prev]);
          showSuccess("Proceso documentado");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  const handleSetAssetStatus = (id: string, status: string) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const { error } = await supabase
          .from("process_assets")
          .update({ status })
          .eq("id", id);
        if (error) {
          showError("Error al actualizar el estado.");
        } else {
          setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
          showSuccess("Estado actualizado");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #0a0e1a 0%, #070a12 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "32px 36px",
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #5b8aff22, #5b8aff0a)",
              border: "1px solid rgba(91,138,255,0.25)",
              color: "#9fb9ff",
            }}
          >
            <Target size={18} strokeWidth={1.6} />
          </div>
          <h1
            className="text-white"
            style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4 }}
          >
            Plan 90D
          </h1>
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginLeft: 52 }}>
          Rocas · BOS · Ideas · Decisiones — el sistema completo de ejecución estratégica
        </p>
      </div>

      {/* Toasts */}
      {successMsg && (
        <div
          className="mb-4 rounded-xl border px-4 py-3"
          style={{
            background: "rgba(52,211,153,0.1)",
            borderColor: "rgba(52,211,153,0.3)",
            color: "#34d399",
            fontSize: 13.5,
          }}
        >
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div
          className="mb-4 rounded-xl border px-4 py-3"
          style={{
            background: "rgba(248,113,113,0.1)",
            borderColor: "rgba(248,113,113,0.3)",
            color: "#f87171",
            fontSize: 13.5,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Tab bar */}
      <div className="mb-6 flex overflow-x-auto">
        <div
          className="flex gap-1 rounded-2xl p-1"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              style={
                tab === t.key
                  ? {
                      background: "rgba(91,138,255,0.2)",
                      color: "#9fb9ff",
                      border: "1px solid rgba(91,138,255,0.3)",
                    }
                  : {
                      color: "rgba(255,255,255,0.4)",
                      border: "1px solid transparent",
                    }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel content */}
      <div className="max-w-3xl">
        {tab === "rocks" && (
          <RocksPanel
            rocks={rocks}
            team={team}
            currentUserId={userId}
            companyId={companyId}
            isPending={isPending}
            onCreateRock={handleCreateRock}
            onUpdateProgress={handleUpdateProgress}
            onUpdateStatus={handleUpdateRockStatus}
          />
        )}
        {tab === "bos" && (
          <BosPanel
            indicators={indicators}
            team={team}
            currentUserId={userId}
            weekDate={weekDate}
            isPending={isPending}
            onCreateIndicator={handleCreateIndicator}
            onUpdateValue={handleUpdateIndicatorValue}
          />
        )}
        {tab === "matrix" && (
          <MatrixPanel
            isPending={isPending}
            onPromoteToRock={handlePromoteToRock}
          />
        )}
        {tab === "ideas" && (
          <IdeasPanel
            ideas={ideas}
            team={team}
            isPending={isPending}
            onCreateIdea={handleCreateIdea}
            onPromoteIdea={(id) => handleIdeaStatus(id, "promoted")}
            onDiscardIdea={(id) => handleIdeaStatus(id, "discarded")}
          />
        )}
        {tab === "decisions" && (
          <DecisionsPanel
            decisions={decisions}
            isPending={isPending}
            onCreateDecision={handleCreateDecision}
          />
        )}
        {tab === "activos" && (
          <ActivosPanel
            assets={assets}
            team={team}
            isArquitecto={currentProfile.role === "arquitecto"}
            isPending={isPending}
            onCreate={handleCreateAsset}
            onSetStatus={handleSetAssetStatus}
          />
        )}
      </div>
    </div>
  );
}
