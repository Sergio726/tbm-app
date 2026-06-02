"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Mail, Lock, User } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

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

const TIMEZONES: string[] = (() => {
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
    "UTC",
  ];
})();

const ROLE_LABEL: Record<string, string> = {
  arquitecto: "Arquitecto",
  colaborador: "Colaborador",
  observador: "Observador",
};

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

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [cargo, setCargo] = useState(profile.cargo ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [timezone, setTimezone] = useState(profile.timezone ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErr, setProfileErr] = useState("");
  const [uploading, setUploading] = useState(false);

  const [newEmail, setNewEmail] = useState(email);
  const [emailMsg, setEmailMsg] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");
  const [passBusy, setPassBusy] = useState(false);

  async function saveProfile() {
    if (savingProfile) return;
    setSavingProfile(true);
    setProfileErr("");
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
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2200);
      router.refresh();
    } catch (e) {
      console.error("Error guardando perfil:", e);
      setProfileErr("No se pudo guardar. Intentá de nuevo.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function uploadAvatar(file: File) {
    if (!file.type.startsWith("image/")) {
      setProfileErr("El archivo debe ser una imagen.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setProfileErr("La imagen no puede superar 4 MB.");
      return;
    }
    setUploading(true);
    setProfileErr("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${profile.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`; // cache-bust
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", profile.id);
      if (error) throw error;
      setAvatarUrl(url);
      router.refresh();
    } catch (e) {
      console.error("Error subiendo avatar:", e);
      setProfileErr("No se pudo subir la foto. ¿Ya está aplicada la migración del bucket 'avatars'?");
    } finally {
      setUploading(false);
    }
  }

  async function changeEmail() {
    if (!newEmail.trim() || newEmail.trim() === email) {
      setEmailErr("Ingresá un email distinto al actual.");
      return;
    }
    setEmailBusy(true);
    setEmailErr("");
    setEmailMsg("");
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      setEmailMsg(
        "Te enviamos un email de confirmación al nuevo correo. El cambio se aplica cuando lo confirmes."
      );
    } catch (e) {
      console.error("Error cambiando email:", e);
      setEmailErr("No se pudo cambiar el email.");
    } finally {
      setEmailBusy(false);
    }
  }

  async function changePassword() {
    if (pass1.length < 6) {
      setPassErr("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (pass1 !== pass2) {
      setPassErr("Las contraseñas no coinciden.");
      return;
    }
    setPassBusy(true);
    setPassErr("");
    setPassMsg("");
    try {
      const { error } = await supabase.auth.updateUser({ password: pass1 });
      if (error) throw error;
      setPass1("");
      setPass2("");
      setPassMsg("Contraseña actualizada.");
    } catch (e) {
      console.error("Error cambiando contraseña:", e);
      setPassErr("No se pudo cambiar la contraseña.");
    } finally {
      setPassBusy(false);
    }
  }

  return (
    <div
      className="text-white"
      style={{ padding: "32px 40px 60px", maxWidth: 760, margin: "0 auto", width: "100%", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="mb-7">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[1.4px] text-white/50">
          Mi cuenta
        </div>
        <h1 className="m-0 text-[30px] font-bold tracking-[-0.6px]">Perfil y cuenta</h1>
        <p className="mt-1.5 text-sm text-white/55">
          Actualizá tus datos personales, tu foto y los accesos de tu cuenta.
        </p>
      </div>

      {/* Datos personales */}
      <section className="tbm-card mb-5 p-6">
        <SectionTitle Icon={User} label="Datos personales" color="#5b8aff" />

        {/* Avatar */}
        <div className="mb-5 flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover"
                style={{ border: "2px solid rgba(255,255,255,0.1)" }}
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ background: "linear-gradient(135deg, #5b8aff, #2c5fe6)" }}
              >
                {getInitials(fullName || email)}
              </div>
            )}
          </div>
          <div>
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
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg border border-tbm-border px-3.5 py-2 text-sm font-medium text-tbm-text-secondary transition-colors hover:bg-tbm-elevated hover:text-white disabled:opacity-60"
            >
              <Camera size={15} /> {uploading ? "Subiendo…" : "Cambiar foto"}
            </button>
            <p className="mt-1.5 text-[11px] text-white/40">JPG o PNG, hasta 4 MB.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo">
            <input className="tbm-input w-full" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan García" />
          </Field>
          <Field label="Cargo / área">
            <input className="tbm-input w-full" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Operaciones" />
          </Field>
          <Field label="Teléfono (opcional)">
            <input className="tbm-input w-full" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+54 9 11 ..." />
          </Field>
          <Field label="Zona horaria (opcional)">
            <select
              className="tbm-input w-full"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value="">— Sin definir —</option>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
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

        {profileErr && <p className="mt-3 text-sm text-tbm-red">{profileErr}</p>}

        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={saveProfile} disabled={savingProfile} className="tbm-btn-primary">
            {savingProfile ? "Guardando…" : "Guardar cambios"}
          </button>
          {profileSaved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-tbm-green">
              <Check size={15} /> Guardado
            </span>
          )}
        </div>
      </section>

      {/* Email */}
      <section className="tbm-card mb-5 p-6">
        <SectionTitle Icon={Mail} label="Email de acceso" color="#34d399" />
        <Field label="Email">
          <input className="tbm-input w-full" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        </Field>
        {emailErr && <p className="mt-2 text-sm text-tbm-red">{emailErr}</p>}
        {emailMsg && <p className="mt-2 text-sm text-tbm-green">{emailMsg}</p>}
        <button type="button" onClick={changeEmail} disabled={emailBusy} className="tbm-btn-primary mt-4">
          {emailBusy ? "Enviando…" : "Actualizar email"}
        </button>
      </section>

      {/* Contraseña */}
      <section className="tbm-card mb-5 p-6">
        <SectionTitle Icon={Lock} label="Contraseña" color="#fbbf24" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nueva contraseña">
            <input className="tbm-input w-full" type="password" value={pass1} onChange={(e) => setPass1(e.target.value)} placeholder="••••••••" />
          </Field>
          <Field label="Repetir contraseña">
            <input className="tbm-input w-full" type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="••••••••" />
          </Field>
        </div>
        {passErr && <p className="mt-2 text-sm text-tbm-red">{passErr}</p>}
        {passMsg && <p className="mt-2 text-sm text-tbm-green">{passMsg}</p>}
        <button type="button" onClick={changePassword} disabled={passBusy} className="tbm-btn-primary mt-4">
          {passBusy ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </section>

      {/* Solo lectura */}
      <section className="tbm-card p-6">
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wide text-white/40">Rol</div>
            <div className="text-white/80">{ROLE_LABEL[profile.role ?? ""] ?? profile.role ?? "—"}</div>
          </div>
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wide text-white/40">Empresa</div>
            <div className="text-white/80">{companyName ?? "—"}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

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
