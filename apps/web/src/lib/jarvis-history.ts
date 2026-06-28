"use server";

// DC-6 · Lectura del historial de DC para el panel. RLS limita a las conversaciones
// del usuario actual. La escritura la hace el route /api/jarvis (server-side).

import { createClient } from "@/lib/supabase/server";

export type ConversationSummary = { id: string; title: string | null; updated_at: string };
export type StoredMessage = { role: "user" | "assistant"; content: string };

export async function listConversations(): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("ai_conversations")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false })
    .limit(30);
  return (data ?? []) as ConversationSummary[];
}

export async function getConversationMessages(conversationId: string): Promise<StoredMessage[]> {
  if (!conversationId) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data ?? []) as StoredMessage[];
}
