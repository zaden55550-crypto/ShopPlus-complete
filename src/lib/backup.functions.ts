import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateBackup } from "@/lib/backup";
import type { Json } from "@/integrations/supabase/types";
export const saveCloudBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ deviceId: z.string().uuid(), revision: z.number().int().nonnegative(), shop: z.string().max(100), payload: z.unknown() }).parse(v))
  .handler(async ({ data, context }) => {
    validateBackup(data.payload);
    if (JSON.stringify(data.payload).length > 14000000) throw new Error("Backup exceeds the size limit");
    const r = await context.supabase.from("shopbook_device_backups").upsert({ user_id: context.userId, device_id: data.deviceId, revision: data.revision, shop_name: data.shop, payload: data.payload as Json }, { onConflict: "user_id,device_id" }).select("updated_at,revision").single();
    if (r.error) throw new Error(r.error.message);
    if (r.data.revision !== data.revision) throw new Error("A newer backup already exists; retrying with a newer revision");
    return r.data;
  });
export const listCloudBackups = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const r = await context.supabase.from("shopbook_device_backups").select("device_id,shop_name,updated_at").eq("user_id", context.userId).order("updated_at", { ascending: false });
  if (r.error) throw new Error(r.error.message); return r.data;
});
export const getCloudBackup = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((v) => z.object({ deviceId: z.string().uuid() }).parse(v)).handler(async ({ data, context }) => {
  const r = await context.supabase.from("shopbook_device_backups").select("payload").eq("user_id", context.userId).eq("device_id", data.deviceId).single();
  if (r.error) throw new Error(r.error.message); return JSON.stringify(r.data.payload);
});
