"use client";

import type { FeedbackType } from "@/types/database";
import { SEC_CONFIG } from "@/lib/feedback";

interface SecTypeSelectorProps {
  value: FeedbackType | null;
  onChange: (t: FeedbackType) => void;
}

export function SecTypeSelector({ value, onChange }: SecTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {(["S", "E", "C"] as FeedbackType[]).map((type) => {
        const cfg = SEC_CONFIG[type];
        const isSelected = value === type;

        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className="flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all"
            style={{
              background: isSelected ? cfg.bg : "rgba(255,255,255,0.025)",
              borderColor: isSelected ? cfg.border : "rgba(255,255,255,0.07)",
              cursor: "pointer",
            }}
          >
            {/* Badge */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base font-black"
              style={{
                background: isSelected ? cfg.bg : "rgba(255,255,255,0.04)",
                color: isSelected ? cfg.color : "rgba(255,255,255,0.4)",
                border: `1px solid ${isSelected ? cfg.border : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {type}
            </div>

            {/* Labels */}
            <div className="flex-1">
              <p
                className="font-semibold"
                style={{
                  fontSize: 13.5,
                  color: isSelected ? cfg.color : "rgba(255,255,255,0.75)",
                }}
              >
                {cfg.label}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {cfg.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
