import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateBackup } from "@/lib/backup";

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const countRecords = (p: { data: Record<string, unknown> }) => Object.values(p.data).reduce<number>((n, v) => n + (Array.isArray(v) ? v.length : 0), 0);

/** Saves a full-business snapshot, then re-reads it and checks the SHA-256 before marking it verified. Old verified copies are pruned only after the new one passes. */
export const createSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ deviceId: z.string().uuid(), kind: z.enum(["manual", "automatic", "pre-restore"]), keep: z.number().int().min(3).max(60), text: z.string().max(14000000) }).parse(v))
  .handler(async ({ data, context }) => {
    let parsed: unknown;
    try { parsed = JSON.parse(data.text); } catch { throw new Error("Backup could not be read"); }
    validateBackup(parsed);
    const checksum = await sha256(data.text);
    const ins = await context.supabase.from("shopbook_backup_snapshots").insert({ user_id: context.userId, device_id: data.deviceId, shop_name: parsed.shop, kind: data.kind, payload: data.text, size_bytes: new TextEncoder().encode(data.text).length, checksum, record_count: countRecords(parsed) }).select("id").single();
    if (ins.error) throw new Error(ins.error.message);
    const back = await context.supabase.from("shopbook_backup_snapshots").select("payload").eq("id", ins.data.id).single();
    if (back.error || (await sha256(back.data.payload)) !== checksum) throw new Error("Backup failed verification. Your previous verified backup is still available.");
    validateBackup(JSON.parse(back.data.payload));
    const done = await context.supabase.from("shopbook_backup_snapshots").update({ verified_at: new Date().toISOString() }).eq("id", ins.data.id).select("id,created_at,verified_at,size_bytes,checksum,record_count,kind,shop_name,restore_tested_at").single();
    if (done.error) throw new Error(done.error.message);
    const old = await context.supabase.from("shopbook_backup_snapshots").select("id").eq("user_id", context.userId).not("verified_at", "is", null).order("created_at", { ascending: false }).range(data.keep, 1000);
    if (old.data?.length) await context.supabase.from("shopbook_backup_snapshots").delete().in("id", old.data.map((r) => r.id));
    await context.supabase.from("shopbook_backup_snapshots").delete().eq("user_id", context.userId).is("verified_at", null).lt("created_at", new Date(Date.now() - 3600000).toISOString());
    return done.data;
  });

export const listSnapshots = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const r = await context.supabase.from("shopbook_backup_snapshots").select("id,created_at,verified_at,size_bytes,checksum,record_count,kind,shop_name,restore_tested_at").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(60);
  if (r.error) throw new Error(r.error.message);
  return r.data;
});

/** Returns the snapshot only if its checksum still matches. */
export const getSnapshot = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v)).handler(async ({ data, context }) => {
  const r = await context.supabase.from("shopbook_backup_snapshots").select("payload,checksum,verified_at").eq("user_id", context.userId).eq("id", data.id).single();
  if (r.error) throw new Error(r.error.message);
  if (!r.data.verified_at) throw new Error("This backup was never verified and cannot be restored");
  if ((await sha256(r.data.payload)) !== r.data.checksum) throw new Error("This backup is damaged (checksum mismatch) and cannot be restored");
  return r.data.payload;
});

export const markRestoreTested = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v)).handler(async ({ data, context }) => {
  await context.supabase.from("shopbook_backup_snapshots").update({ restore_tested_at: new Date().toISOString() }).eq("user_id", context.userId).eq("id", data.id);
  return true;
});
