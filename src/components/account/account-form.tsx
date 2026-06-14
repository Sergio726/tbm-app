"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Trash2,
  Building2,
  Shield,
  AlertCircle,
  X,
  Compass,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { RestartTourButton } from "./restart-tour-button";
import type { Profile } from "@/types/database";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

// Timezone list: use browser API when available, fallback to curated list
const TIMEZONES: { value: string; label: string; country: string; region: string }[] = (() => {
  const raw: string[] = (() => {
    try {
      const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] })
        .supportedValuesOf;
      const v = fn?.("timeZone");
      if (Array.isArray(v) && v.length) return v;
    } catch {
      /* ignore */
    }
    return [
      "America/Argentina/Buenos_Aires",
      "America/Mexico_City",
      "America/Bogota",
      "America/Santiago",
      "America/Lima",
      "America/Sao_Paulo",
      "Europe/Madrid",
      "America/New_York",
      "America/Los_Angeles",
      "America/Chicago",
      "UTC",
    ];
  })();

  // Country/region mapping for better search UX
  const countryMap: Record<string, { country: string; region: string }> = {
    "America/Argentina/Buenos_Aires": { country: "Argentina", region: "Buenos Aires" },
    "America/Argentina/Cordoba": { country: "Argentina", region: "Córdoba" },
    "America/Argentina/Mendoza": { country: "Argentina", region: "Mendoza" },
    "America/Mexico_City": { country: "México", region: "Ciudad de México" },
    "America/Monterrey": { country: "México", region: "Monterrey" },
    "America/Cancun": { country: "México", region: "Cancún" },
    "America/Bogota": { country: "Colombia", region: "Bogotá" },
    "America/Santiago": { country: "Chile", region: "Santiago" },
    "America/Lima": { country: "Perú", region: "Lima" },
    "America/Sao_Paulo": { country: "Brasil", region: "São Paulo" },
    "America/Manaus": { country: "Brasil", region: "Manaos" },
    "America/Fortaleza": { country: "Brasil", region: "Fortaleza" },
    "Europe/Madrid": { country: "España", region: "Madrid" },
    "Atlantic/Canary": { country: "España", region: "Canarias" },
    "America/New_York": { country: "Estados Unidos", region: "Nueva York (Este)" },
    "America/Chicago": { country: "Estados Unidos", region: "Chicago (Centro)" },
    "America/Denver": { country: "Estados Unidos", region: "Denver (Montaña)" },
    "America/Los_Angeles": { country: "Estados Unidos", region: "Los Ángeles (Pacífico)" },
    "America/Caracas": { country: "Venezuela", region: "Caracas" },
    "America/Guayaquil": { country: "Ecuador", region: "Guayaquil" },
    "America/La_Paz": { country: "Bolivia", region: "La Paz" },
    "America/Asuncion": { country: "Paraguay", region: "Asunción" },
    "America/Montevideo": { country: "Uruguay", region: "Montevideo" },
    "America/Panama": { country: "Panamá", region: "Ciudad de Panamá" },
    "America/Costa_Rica": { country: "Costa Rica", region: "San José" },
    "America/Guatemala": { country: "Guatemala", region: "Ciudad de Guatemala" },
    "America/Havana": { country: "Cuba", region: "La Habana" },
    "America/Tegucigalpa": { country: "Honduras", region: "Tegucigalpa" },
    "America/Managua": { country: "Nicaragua", region: "Managua" },
    "America/El_Salvador": { country: "El Salvador", region: "San Salvador" },
    "America/Santo_Domingo": { country: "República Dominicana", region: "Santo Domingo" },
    "America/Port-au-Prince": { country: "Haití", region: "Puerto Príncipe" },
    "America/Nassau": { country: "Bahamas", region: "Nassau" },
    "America/Barbados": { country: "Barbados", region: "Bridgetown" },
    "America/Toronto": { country: "Canadá", region: "Toronto (Este)" },
    "America/Vancouver": { country: "Canadá", region: "Vancouver (Pacífico)" },
    "Europe/Lisbon": { country: "Portugal", region: "Lisboa" },
    "Europe/London": { country: "Reino Unido", region: "Londres" },
    "Europe/Paris": { country: "Francia", region: "París" },
    "Europe/Berlin": { country: "Alemania", region: "Berlín" },
    "Europe/Rome": { country: "Italia", region: "Roma" },
    "UTC": { country: "Universal", region: "UTC" },
  };

  return raw.map((tz) => {
    const info = countryMap[tz];
    if (info) {
      return { value: tz, label: `${info.country} / ${tz}`, country: info.country, region: info.region };
    }
    // fallback: format the IANA name as human-readable
    const parts = tz.split("/");
    const country = parts[0] === "America" ? "América" : parts[0] === "Europe" ? "Europa" : parts[0];
    const region = parts[parts.length - 1].replace(/_/g, " ");
    return { value: tz, label: `${country} / ${tz}`, country, region };
  });
})();

const ROLE_LABEL: Record<string, string> = {
  arquitecto: "Arquitecto",
  colaborador: "Colaborador",
  observador: "Observador",
};

const ROLE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  arquitecto: { bg: "rgba(91,138,255,0.12)", text: "#5b8aff", border: "rgba(91,138,255,0.3)" },
  colaborador: { bg: "rgba(52,211,153,0.12)", text: "#34d399", border: "rgba(52,211,153,0.3)" },
  observador: { bg: "rgba(148,163,184,0.1)", text: "#94a3b8", border: "rgba(148,163,184,0.25)" },
};

// ─── password strength ─────────────────────────────────────────────────────────

function getPasswordStrength(p: string): { score: number; label: string; color: string } {
  if (!p) return { score: 0, label: "", color: "" };
  let score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 2) return { score, label: "Débil", color: "var(--semaforo-rojo)" };
  if (score <= 3) return { score, label: "Media", color: "var(--semaforo-amarillo)" };
  return { score, label: "Fuerte", color: "var(--semaforo-verde)" };
}

// ─── toast system ──────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";
interface ToastState { id: number; type: ToastType; message: string }

let toastCounter = 0;

// ─── timezone combobox ─────────────────────────────────────────────────────────

function TimezoneSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return TIMEZONES;
    const q = query.toLowerCase();
    return TIMEZONES.filter(
      (tz) =>
        tz.country.toLowerCase().includes(q) ||
        tz.region.toLowerCase().includes(q) ||
        tz.value.toLowerCase().includes(q)
    );
  }, [query]);

  const selectedLabel = TIMEZONES.find((t) => t.value === value)?.label ?? value;

  // close on outside click
  const handleBlur = useCallback((e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
      setQuery("");
    }
  }, []);

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="tbm-input w-full text-left flex items-center justify-between gap-2"
        style={{ cursor: "pointer" }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value ? (
          <span className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <span className="font-medium truncate">
              {TIMEZONES.find((t) => t.value === value)?.country ?? value}
            </span>
            <span className="font-mono text-[11px] text-white/45 truncate shrink-0">
              {value}
            </span>
          </span>
        ) : (
          <span className="text-tbm-text-muted">— Sin definir —</span>
        )}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-50">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg shadow-lg overflow-hidden"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          <div className="p-2" style={{ borderBottom: "1px solid var(--border)" }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por país o ciudad..."
              className="tbm-input w-full text-sm"
              style={{ padding: "6px 10px" }}
            />
          </div>
          <ul
            role="listbox"
            className="max-h-52 overflow-y-auto py-1"
          >
            <li
              role="option"
              aria-selected={value === ""}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-tbm-elevated transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseDown={() => {
                onChange("");
                setOpen(false);
                setQuery("");
              }}
            >
              — Sin definir —
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm" style={{ color: "var(--text-muted)" }}>
                Sin resultados
              </li>
            ) : (
              filtered.map((tz) => (
                <li
                  key={tz.value}
                  role="option"
                  aria-selected={value === tz.value}
                  className="px-3 py-2 text-sm cursor-pointer transition-colors"
                  style={{
                    background: value === tz.value ? "rgba(37,99,235,0.15)" : undefined,
                    color: value === tz.value ? "var(--accent-light)" : "var(--text-primary)",
                  }}
                  onMouseDown={() => {
                    onChange(tz.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  onMouseEnter={(e) => {
                    if (value !== tz.value)
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (value !== tz.value)
                      (e.currentTarget as HTMLElement).style.background = "";
                  }}
                >
                  <span className="font-medium">{tz.country}</span>
                  <span
                    className="ml-1.5 font-mono text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {tz.value}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────────

export function AccountForm({
  profile,
  email,
  companyName,
}: {
  profile: Profile;
  email: string;
  companyName: string | null;
}) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const fileRef = useRef<HTMLInputElement>(null);

  // ── profile fields ───────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [cargo, setCargo] = useState(profile.cargo ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [timezone, setTimezone] = useState(profile.timezone ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  // ── email ────────────────────────────────────────────────────────────────────
  const [newEmail, setNewEmail] = useState(email);
  const [emailBusy, setEmailBusy] = useState(false);

  // ── password ─────────────────────────────────────────────────────────────────
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [passBusy, setPassBusy] = useState(false);

  // ── toasts ───────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── dirty detection ──────────────────────────────────────────────────────────
  const initialValues = useMemo(() => ({
    fullName: profile.full_name ?? "",
    cargo: profile.cargo ?? "",
    phone: profile.phone ?? "",
    timezone: profile.timezone ?? "",
    bio: profile.bio ?? "",
  }), [profile]);

  const dirty = useMemo(() => {
    return (
      fullName !== initialValues.fullName ||
      cargo !== initialValues.cargo ||
      phone !== initialValues.phone ||
      timezone !== initialValues.timezone ||
      bio !== initialValues.bio
    );
  }, [fullName, cargo, phone, timezone, bio, initialValues]);

  // ── password strength ────────────────────────────────────────────────────────
  const strength = useMemo(() => getPasswordStrength(pass1), [pass1]);
  const passMatch = pass2.length > 0 && pass1 === pass2;
  const passMismatch = pass2.length > 0 && pass1 !== pass2;
  const passMinLen = pass1.length >= 6;

  // ── actions ──────────────────────────────────────────────────────────────────

  async function saveProfile() {
    if (savingProfile || !dirty) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          cargo: cargo.trim() || null,
          phone: phone.trim() || null,
          timezone: timezone || null,
          bio: bio.trim() || null,
        })
        .eq("id", profile.id);
      if (error) throw error;
      addToast("success", "Perfil guardado correctamente.");
      router.refresh();
    } catch (e) {
      console.error("Error guardando perfil:", e);
      addToast("error", "No se pudo guardar el perfil. Intentá de nuevo.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function uploadAvatar(file: File) {
    if (!file.type.startsWith("image/")) {
      addToast("error", "El archivo debe ser una imagen.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      addToast("error", "La imagen no puede superar 4 MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${profile.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", profile.id);
      if (error) throw error;
      setAvatarUrl(url);
      addToast("success", "Foto de perfil actualizada.");
      router.refresh();
    } catch (e) {
      console.error("Error subiendo avatar:", e);
      addToast("error", "No se pudo subir la foto.");
    } finally {
      setUploading(false);
    }
  }

  async function removeAvatar() {
    setRemovingAvatar(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", profile.id);
      if (error) throw error;
      setAvatarUrl("");
      addToast("success", "Foto de perfil eliminada.");
      router.refresh();
    } catch (e) {
      console.error("Error eliminando avatar:", e);
      addToast("error", "No se pudo eliminar la foto.");
    } finally {
      setRemovingAvatar(false);
    }
  }

  async function changeEmail() {
    if (!newEmail.trim() || newEmail.trim() === email) {
      addToast("error", "Ingresá un email distinto al actual.");
      return;
    }
    setEmailBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      addToast(
        "info",
        "Te enviamos un email de confirmación. El cambio se aplica cuando lo confirmes."
      );
    } catch (e) {
      console.error("Error cambiando email:", e);
      addToast("error", "No se pudo cambiar el email.");
    } finally {
      setEmailBusy(false);
    }
  }

  async function changePassword() {
    if (!passMinLen) {
      addToast("error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (pass1 !== pass2) {
      addToast("error", "Las contraseñas no coinciden.");
      return;
    }
    setPassBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pass1 });
      if (error) throw error;
      setPass1("");
      setPass2("");
      addToast("success", "Contraseña actualizada correctamente.");
    } catch (e) {
      console.error("Error cambiando contraseña:", e);
      addToast("error", "No se pudo cambiar la contraseña.");
    } finally {
      setPassBusy(false);
    }
  }

  // ─── render ──────────────────────────────────────────────────────────────────

  const roleColors = ROLE_COLOR[profile.role ?? ""] ?? ROLE_COLOR.observador;

  return (
    <div
      className="text-white"
      style={{
        padding: "32px 40px 80px",
        maxWidth: 760,
        margin: "0 auto",
        width: "100%",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[1.4px] text-white/50">
          Mi cuenta
        </div>
        <h1 className="m-0 text-[30px] font-bold tracking-[-0.6px]">Perfil y cuenta</h1>
        <p className="mt-1.5 text-sm text-white/55">
          Actualizá tus datos personales, tu foto y los accesos de tu cuenta.
        </p>
      </div>

      {/* ── Profile Summary Card ── */}
      <div
        className="tbm-card mb-6 p-5 tbm-rise"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="relative shrink-0 cursor-pointer"
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
            onClick={() => !uploading && fileRef.current?.click()}
            aria-label="Cambiar foto de perfil"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={`Avatar de ${fullName || email}`}
                className="h-16 w-16 rounded-full object-cover"
                style={{ border: "2px solid rgba(255,255,255,0.1)" }}
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ background: "linear-gradient(135deg, #5b8aff, #2c5fe6)" }}
              >
                {getInitials(fullName || email)}
              </div>
            )}
            {/* hover overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center rounded-full transition-opacity duration-150"
              style={{
                background: "rgba(0,0,0,0.55)",
                opacity: avatarHover && !uploading ? 1 : 0,
                pointerEvents: "none",
              }}
            >
              <Camera size={18} className="text-white" />
            </div>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full"
                style={{ background: "rgba(0,0,0,0.6)" }}>
                <span className="text-[10px] text-white font-medium">...</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="text-[17px] font-semibold truncate">
              {fullName || <span className="text-white/40 italic">Sin nombre</span>}
            </div>
            <div className="text-sm text-white/55 truncate">
              {cargo || <span className="italic text-white/30">Sin cargo</span>}
            </div>
            <div className="mt-1 text-xs text-white/40 truncate">{email}</div>
          </div>

          {/* Badges */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                background: roleColors.bg,
                color: roleColors.text,
                border: `1px solid ${roleColors.border}`,
              }}
            >
              <Shield size={10} strokeWidth={2.5} />
              {ROLE_LABEL[profile.role ?? ""] ?? profile.role ?? "—"}
            </span>
            {companyName && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  background: "rgba(248,250,252,0.06)",
                  color: "var(--text-secondary)",
                  border: "1px solid rgba(248,250,252,0.1)",
                }}
              >
                <Building2 size={10} strokeWidth={2.5} />
                {companyName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Datos personales ── */}
      <section className="tbm-card mb-5 p-6 tbm-rise" style={{ animationDelay: "40ms" }}>
        <SectionTitle Icon={User} label="Datos personales" color="#5b8aff" />

        {/* Avatar actions */}
        <div className="mb-5 flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadAvatar(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || removingAvatar}
            aria-label="Subir nueva foto de perfil"
            className="inline-flex items-center gap-2 rounded-lg border border-tbm-border px-3.5 py-2 text-sm font-medium text-tbm-text-secondary transition-colors hover:bg-tbm-elevated hover:text-white disabled:opacity-60"
          >
            <Camera size={14} />
            {uploading ? "Subiendo…" : "Cambiar foto"}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={removeAvatar}
              disabled={uploading || removingAvatar}
              aria-label="Quitar foto de perfil"
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 px-3.5 py-2 text-sm font-medium text-red-400/70 transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-60"
            >
              <Trash2 size={14} />
              {removingAvatar ? "Quitando…" : "Quitar foto"}
            </button>
          )}
          <p className="ml-auto text-[11px] text-white/30">JPG o PNG, hasta 4 MB.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo">
            <input
              className="tbm-input w-full"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan García"
            />
          </Field>
          <Field label="Cargo / área">
            <input
              className="tbm-input w-full"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Operaciones"
            />
          </Field>
          <Field label="Teléfono (opcional)">
            <input
              className="tbm-input w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 9 11 ..."
            />
          </Field>
          <Field label="Zona horaria (opcional)">
            <TimezoneSelect value={timezone} onChange={setTimezone} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Bio / sobre mí (opcional)">
              <textarea
                className="tbm-input w-full"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Una línea sobre vos, tu rol o tu foco."
                style={{ resize: "vertical" }}
              />
            </Field>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={saveProfile}
            disabled={savingProfile || !dirty}
            className="tbm-btn-primary"
          >
            {savingProfile ? "Guardando…" : "Guardar cambios"}
          </button>
          {dirty && !savingProfile && (
            <span className="inline-flex items-center gap-1.5 text-xs text-tbm-yellow">
              <AlertCircle size={13} />
              Tenés cambios sin guardar
            </span>
          )}
        </div>
      </section>

      {/* ── Email ── */}
      <section className="tbm-card mb-5 p-6 tbm-rise" style={{ animationDelay: "80ms" }}>
        <SectionTitle Icon={Mail} label="Email de acceso" color="#34d399" />
        <Field label="Email">
          <input
            className="tbm-input w-full"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </Field>
        <p className="mt-2 text-[11px] text-white/35">
          Al cambiar el email recibirás un correo de confirmación. El cambio se aplica cuando lo confirmés.
        </p>
        <button
          type="button"
          onClick={changeEmail}
          disabled={emailBusy || !newEmail.trim() || newEmail.trim() === email}
          className="tbm-btn-primary mt-4"
        >
          {emailBusy ? "Enviando…" : "Actualizar email"}
        </button>
      </section>

      {/* ── Contraseña ── */}
      <section className="tbm-card p-6 tbm-rise" style={{ animationDelay: "120ms" }}>
        <SectionTitle Icon={Lock} label="Contraseña" color="#fbbf24" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nueva contraseña">
            <div className="relative">
              <input
                className="tbm-input w-full pr-10"
                type={showPass1 ? "text" : "password"}
                value={pass1}
                onChange={(e) => setPass1(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass1((v) => !v)}
                aria-label={showPass1 ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPass1 ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="Repetir contraseña">
            <div className="relative">
              <input
                className="tbm-input w-full pr-10"
                type={showPass2 ? "text" : "password"}
                value={pass2}
                onChange={(e) => setPass2(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass2((v) => !v)}
                aria-label={showPass2 ? "Ocultar confirmación" : "Mostrar confirmación"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPass2 ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
        </div>

        {/* Strength meter */}
        {pass1.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-white/40">Fortaleza</span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: strength.color }}
              >
                {strength.label}
              </span>
            </div>
            <div
              className="h-1.5 w-full rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(strength.score / 5) * 100}%`,
                  background: strength.color,
                }}
              />
            </div>
          </div>
        )}

        {/* Checklist */}
        {(pass1.length > 0 || pass2.length > 0) && (
          <ul className="mt-3 space-y-1.5">
            <CheckItem ok={passMinLen} label="Al menos 6 caracteres" />
            <CheckItem ok={/[A-Z]/.test(pass1) && /[a-z]/.test(pass1)} label="Mayúsculas y minúsculas" />
            <CheckItem ok={/[0-9]/.test(pass1)} label="Al menos un número" />
            {pass2.length > 0 && (
              <CheckItem ok={passMatch} label="Las contraseñas coinciden" error={passMismatch} />
            )}
          </ul>
        )}

        <button
          type="button"
          onClick={changePassword}
          disabled={passBusy || !passMinLen || !passMatch}
          className="tbm-btn-primary mt-4"
        >
          {passBusy ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </section>

      {/* ── Ayuda — tour guiado (S11) ── */}
      <section
        className="tbm-card mt-5 p-6 tbm-rise"
        style={{ animationDelay: "160ms" }}
      >
        <SectionTitle Icon={Compass} label="Ayuda" color="#a78bfa" />
        <p
          className="mb-3 text-[12.5px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          ¿Te perdiste? Repetí el recorrido guiado por los módulos del sistema.
        </p>
        <RestartTourButton userId={profile.id} />
      </section>

      {/* ── Toast container ── */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  );
}

// ─── sub-components ────────────────────────────────────────────────────────────

function SectionTitle({
  Icon,
  label,
  color,
}: {
  Icon: typeof User;
  label: string;
  color: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-lg"
        style={{ background: `${color}1c`, border: `1px solid ${color}33`, color }}
      >
        <Icon size={14} strokeWidth={2} />
      </div>
      <span className="text-[14px] font-semibold">{label}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-tbm-text-secondary">{label}</label>
      {children}
    </div>
  );
}

function CheckItem({ ok, label, error }: { ok: boolean; label: string; error?: boolean }) {
  return (
    <li className="flex items-center gap-2 text-[12px]" style={{
      color: ok ? "var(--semaforo-verde)" : error ? "var(--semaforo-rojo)" : "var(--text-muted)"
    }}>
      {ok ? (
        <Check size={12} strokeWidth={2.5} />
      ) : (
        <div
          className="w-3 h-3 rounded-full border"
          style={{
            borderColor: error ? "var(--semaforo-rojo)" : "var(--text-muted)",
            opacity: 0.6
          }}
        />
      )}
      {label}
    </li>
  );
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastState;
  onDismiss: (id: number) => void;
}) {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <Check size={14} strokeWidth={2.5} />,
    error: <AlertCircle size={14} />,
    info: <Mail size={14} />,
  };
  const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: {
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.3)",
      icon: "var(--semaforo-verde)",
    },
    error: {
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.3)",
      icon: "var(--semaforo-rojo)",
    },
    info: {
      bg: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.3)",
      icon: "var(--accent-light)",
    },
  };
  const c = colors[toast.type];

  return (
    <div
      className="tbm-toast pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg"
      style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${c.border}`,
        minWidth: 280,
        maxWidth: 380,
      }}
      role="status"
    >
      <span className="mt-0.5 shrink-0" style={{ color: c.icon }}>
        {icons[toast.type]}
      </span>
      <span className="text-sm leading-snug text-white/90 flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
        className="shrink-0 mt-0.5 text-white/30 hover:text-white/70 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
}
