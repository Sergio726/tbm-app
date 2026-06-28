"use client";

import { useEffect } from "react";
import { X, Users, Sun, Moon, Crown, Send, MessageSquare, Flame } from "lucide-react";
import type { Profile } from "@/types/database";
import {
  DISC_COLORS,
  DISC_DIMENSIONS,
  DISC_FACTORS,
  DISC_LEADERSHIP_TIPS,
  normalizeLetters,
  primaryLetter,
  profileByKey,
  segToPct,
  type DiscLetter,
} from "@/lib/disc";

const DIM_ORDER: DiscLetter[] = ["D", "I", "S", "C"];

function initials(name: string | null): string {
  return (
    (name ?? "?")
      .trim()
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export function MemberReportModal({
  member,
  team,
  onClose,
}: {
  member: Profile;
  team: Profile[];
  onClose: () => void;
}) {
  // Cerrar con la tecla Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const primary = primaryLetter(member.disc_letters);
  const profile = profileByKey(member.disc_profile_key);
  const factor = primary ? DISC_FACTORS[primary] : null;
  const tips = primary ? DISC_LEADERSHIP_TIPS[primary] : null;
  const color = primary ? DISC_COLORS[primary] : "#64748b";
  const firstName = member.full_name?.split(" ")[0] ?? "esta persona";

  const segments =
    (member.disc_scores as { segments?: Record<string, number> } | null)?.segments ?? null;

  // Distribución del equipo por letra primaria
  const withDisc = team.filter((m) => normalizeLetters(m.disc_letters));
  const dist: Record<DiscLetter, number> = { D: 0, I: 0, S: 0, C: 0 };
  withDisc.forEach((m) => {
    const p = primaryLetter(m.disc_letters);
    if (p) dist[p] += 1;
  });
  const maxDist = Math.max(1, ...DIM_ORDER.map((l) => dist[l]));
  const sameStyle = withDisc.filter(
    (m) => m.id !== member.id && primaryLetter(m.disc_letters) === primary
  );
  const complementary = withDisc.filter(
    (m) => m.id !== member.id && primaryLetter(m.disc_letters) !== primary
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(5,10,20,0.72)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[calc(100vh-4rem)] w-full max-w-[680px] flex-col overflow-hidden rounded-2xl border border-border bg-[var(--surface)] shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center gap-3.5 border-b border-white/[0.07] p-5">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-fg"
            style={{ background: color }}
          >
            {initials(member.full_name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[17px] font-bold text-fg">
                {member.full_name ?? "Sin nombre"}
              </h2>
              {member.disc_letters && (
                <span className="inline-flex gap-0.5">
                  {normalizeLetters(member.disc_letters)
                    .split("")
                    .map((l, i) => (
                      <span
                        key={i}
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold text-fg"
                        style={{ background: DISC_COLORS[l as DiscLetter] ?? "#475569" }}
                      >
                        {l}
                      </span>
                    ))}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-fg-muted">
              {profile?.name ? `${profile.icon ?? ""} ${profile.name}` : "Perfil DISC"}
              {member.cargo ? ` · ${member.cargo}` : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-fg-muted hover:text-fg">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Barras del perfil */}
          {segments && (
            <Section title="Perfil DISC" Icon={Users}>
              <div className="space-y-2.5">
                {DIM_ORDER.map((l) => {
                  const seg = segments[l] ?? 4;
                  return (
                    <div key={l}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-fg">
                          <span className="font-bold" style={{ color: DISC_COLORS[l] }}>
                            {l}
                          </span>{" "}
                          {DISC_DIMENSIONS[l].name}
                        </span>
                        <span className="text-fg-muted">{seg}/7</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${segToPct(seg)}%`, background: DISC_COLORS[l] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Luz / Sombra */}
          {factor && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TraitCard title="Su luz" Icon={Sun} tone="#fbbf24" items={factor.luz} />
              <TraitCard title="Su sombra" Icon={Moon} tone="#a78bfa" items={factor.sombra} />
            </div>
          )}

          {/* Comparación con el equipo */}
          <Section title="Comparación con el equipo" Icon={Users}>
            <p className="mb-3 text-[13px] text-fg-muted">
              {primary ? (
                <>
                  <span className="font-semibold text-fg">{sameStyle.length + 1}</span> de{" "}
                  <span className="font-semibold text-fg">{withDisc.length}</span> personas con DISC
                  comparten el estilo dominante{" "}
                  <span className="font-bold" style={{ color }}>
                    {primary} · {DISC_DIMENSIONS[primary].name}
                  </span>
                  .
                </>
              ) : (
                "Cargá las letras DISC del miembro para ver la comparación."
              )}
            </p>

            {/* Distribución */}
            <div className="space-y-1.5">
              {DIM_ORDER.map((l) => (
                <div key={l} className="flex items-center gap-2">
                  <span
                    className="w-4 text-center text-[11px] font-bold"
                    style={{ color: DISC_COLORS[l] }}
                  >
                    {l}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(dist[l] / maxDist) * 100}%`,
                        background: DISC_COLORS[l],
                        opacity: l === primary ? 1 : 0.55,
                      }}
                    />
                  </div>
                  <span className="w-5 text-right text-[11px] text-fg-muted">{dist[l]}</span>
                </div>
              ))}
            </div>

            {/* Complementarios / mismo estilo */}
            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PeopleList
                label="Te complementan"
                hint="otros estilos que equilibran al equipo"
                people={complementary}
              />
              <PeopleList
                label="Mismo estilo dominante"
                hint="cuidado: pueden competir o solaparse"
                people={sameStyle}
              />
            </div>
          </Section>

          {/* Recomendaciones de liderazgo */}
          {tips && (
            <Section title={`Cómo liderar a ${firstName}`} Icon={Crown}>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <TipCard Icon={Send} label="Delegar" text={tips.delegar} />
                <TipCard Icon={Flame} label="Motivar" text={tips.motivar} />
                <TipCard Icon={MessageSquare} label="Dar feedback" text={tips.feedback} />
                <TipCard Icon={Users} label="Evitar fricción" text={tips.friccion} />
              </div>
              {factor && (
                <p className="mt-3 text-[12px] leading-relaxed text-fg-muted">
                  <span className="font-semibold text-fg">Bajo presión:</span>{" "}
                  {factor.underPressure}
                </p>
              )}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={15} className="text-[#9fb9ff]" />
        <h3 className="text-[13.5px] font-semibold text-fg">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TraitCard({
  title,
  Icon,
  tone,
  items,
}: {
  title: string;
  Icon: typeof Sun;
  tone: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={14} style={{ color: tone }} />
        <h4 className="text-[12.5px] font-semibold" style={{ color: tone }}>
          {title}
        </h4>
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-[12.5px] leading-snug text-fg">
            <span style={{ color: tone }}>·</span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PeopleList({
  label,
  hint,
  people,
}: {
  label: string;
  hint: string;
  people: Profile[];
}) {
  return (
    <div>
      <p className="text-[12px] font-semibold text-fg">{label}</p>
      <p className="mb-2 text-[11px] text-fg-muted">{hint}</p>
      {people.length === 0 ? (
        <p className="text-[12px] text-fg-muted">— Nadie por ahora.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {people.map((p) => {
            const pl = primaryLetter(p.disc_letters);
            const c = pl ? DISC_COLORS[pl] : "#64748b";
            return (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] text-fg"
                style={{ borderColor: `${c}40`, background: `${c}14` }}
              >
                <span className="font-bold" style={{ color: c }}>
                  {pl ?? "—"}
                </span>
                {p.full_name?.split(" ")[0] ?? "—"}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TipCard({
  Icon,
  label,
  text,
}: {
  Icon: typeof Send;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-[#9fb9ff]">
        <Icon size={13} /> {label}
      </div>
      <p className="text-[12.5px] leading-snug text-fg">{text}</p>
    </div>
  );
}
