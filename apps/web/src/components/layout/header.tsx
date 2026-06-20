import { createClient } from "@/lib/supabase/server";

interface HeaderProps {
  title?: string;
}

export async function Header({ title }: HeaderProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  let company = null;

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*, companies(name)")
      .eq("id", user.id)
      .single();

    profile = profileData;
    company = profileData?.companies as { name: string } | null;
  }

  const initials = profile?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "A";

  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b border-tbm-border sticky top-0 z-30"
      style={{ background: "var(--bg-surface)" }}
    >
      {/* Título de la sección */}
      <div>
        {title && (
          <h1 className="text-tbm-text-primary text-sm font-semibold">
            {title}
          </h1>
        )}
      </div>

      {/* Derecha: empresa + avatar */}
      <div className="flex items-center gap-4">
        {company && (
          <span className="text-tbm-text-muted text-sm hidden sm:block">
            {company.name}
          </span>
        )}

        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-tbm-blue-muted flex items-center justify-center text-tbm-blue-light text-xs font-semibold">
            {initials}
          </div>
          <span className="text-tbm-text-secondary text-sm hidden md:block group-hover:text-tbm-text-primary transition-colors">
            {profile?.full_name ?? user?.email}
          </span>
        </div>
      </div>
    </header>
  );
}
