"use client";

import { useState } from "react";
import type { SliderDef } from "@/lib/workbook-sessions";

interface Props {
  exerciseKey: string;
  sliders: SliderDef[];
  savedResponse: Record<string, unknown>;
  onSave: (key: string, data: Record<string, unknown>) => void;
  isPending: boolean;
}

function sliderColor(v: number): string {
  if (v < 40) return "#f87171";
  if (v < 70) return "#fbbf24";
  return "#34d399";
}

export function ExerciseSliderGroup({ exerciseKey, sliders, savedResponse, onSave, isPending }: Props) {
  const savedValues = (savedResponse.values ?? {}) as Record<string, number>;

  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(sliders.map((s) => [s.key, typeof savedValues[s.key] === "number" ? savedValues[s.key] : 50]))
  );

  const set = (key: string, v: number) => setValues((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-5">
      {sliders.map((slider) => {
        const v = values[slider.key];
        const color = sliderColor(v);
        return (
          <div key={slider.key}>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: "var(--fg-muted)" }}>
                {slider.label}
              </label>
              <span className="text-sm font-bold" style={{ color, minWidth: 38, textAlign: "right" }}>
                {v}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={v}
                onChange={(e) => set(slider.key, Number(e.target.value))}
                className="w-full cursor-pointer appearance-none"
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: `linear-gradient(to right, ${color} ${v}%, rgba(255,255,255,0.1) ${v}%)`,
                  accentColor: color,
                }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs" style={{ color: "var(--fg-muted)" }}>
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        );
      })}

      <div className="flex justify-end">
        <button
          onClick={() => onSave(exerciseKey, { values })}
          disabled={isPending}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: "rgba(91,138,255,0.2)",
            border: "1px solid rgba(91,138,255,0.4)",
            color: "var(--accent-text)",
          }}
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
