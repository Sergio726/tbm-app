"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const LEVELS = [
  { level: 1, emoji: "😴", label: "Agotado" },
  { level: 2, emoji: "😕", label: "Bajo" },
  { level: 3, emoji: "😐", label: "Normal" },
  { level: 4, emoji: "😊", label: "Bien" },
  { level: 5, emoji: "🔥", label: "Máximo" },
];

interface Props {
  userId: string;
  companyId: string;
  currentLevel: number | null;
  date: string;
}

export default function EnergySelector({
  userId,
  companyId,
  currentLevel,
  date,
}: Props) {
  const supabase = createBrowserClient();
  const [selected, setSelected] = useState<number | null>(currentLevel);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (level: number) => {
    if (loading) return;
    setLoading(true);
    setSelected(level);

    await supabase.from("energy_logs").upsert(
      {
        user_id: userId,
        company_id: companyId,
        level,
        log_date: date,
      },
      { onConflict: "user_id,log_date" }
    );

    setLoading(false);
  };

  const current = LEVELS.find((l) => l.level === selected);

  return (
    <div className="flex flex-col items-end gap-1">
      <p className="text-xs text-tbm-text-muted">
        Mi energía hoy{" "}
        {current && (
          <span className="text-white font-medium">— {current.label}</span>
        )}
      </p>
      <div className="flex gap-1">
        {LEVELS.map((l) => (
          <button
            key={l.level}
            onClick={() => handleSelect(l.level)}
            title={l.label}
            disabled={loading}
            className={cn(
              "w-8 h-8 rounded-lg text-base transition-all border",
              selected === l.level
                ? "border-tbm-blue bg-tbm-blue/20 scale-110"
                : "border-tbm-border bg-tbm-surface hover:border-tbm-blue/40 hover:scale-105 opacity-60 hover:opacity-100"
            )}
          >
            {l.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
