import { z } from "zod";

export const reorderInput = z.object({
  language: z.string().max(30), period: z.number().int().min(1).max(3650),
  lead: z.number().int().min(0).max(365), cover: z.number().int().min(1).max(365), safety: z.number().int().min(0).max(365),
  products: z.array(z.object({ id: z.string().max(100), name: z.string().trim().min(1).max(120), stock: z.number().finite().min(0), sold: z.number().finite().min(0), incoming: z.number().finite().min(0), cost: z.number().finite().min(0) })).min(1).max(100),
});
export type ReorderInput = z.infer<typeof reorderInput>;
// Output schemas stay small and unconstrained; quantities are validated after generation.
export const reorderOutput = z.object({ recommendations: z.array(z.object({ id: z.string(), quantity: z.number(), reason: z.string() })), summary: z.string() });
export type ReorderOutput = z.infer<typeof reorderOutput>;

export function normalizeReorder(output: ReorderOutput, input: ReorderInput): ReorderOutput {
  const seen = new Set<string>();
  return { summary: output.summary.slice(0, 2000), recommendations: output.recommendations.filter(r => input.products.some(p => p.id === r.id) && !seen.has(r.id) && seen.add(r.id)).map(r => ({ ...r, quantity: Number.isFinite(r.quantity) ? Math.min(1000000, Math.max(0, Math.ceil(r.quantity))) : 0, reason: r.reason.slice(0, 1500) })) };
}