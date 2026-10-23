// Admin-published system status messages. Latest valid set is cached on the device so it still shows during an outage.
import { supabase } from "@/integrations/supabase/client";

export type Announcement = { id: string; message: string; kind: "info" | "degraded" | "outage" | "maintenance"; starts_at: string; ends_at: string | null; dismissible: boolean; active: boolean };
const CACHE = "shopbook.announcements", DISMISSED = "shopbook.announcementsDismissed";

/** Pure: which announcements should show now. */
export function visibleAnnouncements(list: Announcement[], now: number, dismissed: string[]): Announcement[] {
  return list.filter((a) => a.active && Date.parse(a.starts_at) <= now && (!a.ends_at || Date.parse(a.ends_at) > now) && !(a.dismissible && dismissed.includes(a.id)));
}
export function cachedAnnouncements(): { list: Announcement[]; at: number } {
  try { return JSON.parse(localStorage.getItem(CACHE) || "") as { list: Announcement[]; at: number }; } catch { return { list: [], at: 0 }; }
}
export function dismissedIds(): string[] { try { return JSON.parse(localStorage.getItem(DISMISSED) || "[]") as string[]; } catch { return []; } }
export function dismiss(id: string) { localStorage.setItem(DISMISSED, JSON.stringify([...dismissedIds(), id].slice(-50))); }
/** Fetch from server; on failure keep the cached copy (fresh = false). */
export async function refreshAnnouncements(): Promise<{ list: Announcement[]; at: number; fresh: boolean }> {
  try {
    const { data, error } = await supabase.from("system_announcements").select("id,message,kind,starts_at,ends_at,dismissible,active").eq("active", true).order("created_at", { ascending: false }).limit(10);
    if (error) throw error;
    const c = { list: (data ?? []) as Announcement[], at: Date.now() };
    localStorage.setItem(CACHE, JSON.stringify(c));
    return { ...c, fresh: true };
  } catch { return { ...cachedAnnouncements(), fresh: false }; }
}
