import { describe, expect, it } from 'vitest';
import { normalizeReorder, reorderInput } from '../lib/reorder';
const input = { language: 'English', period: 30, lead: 7, cover: 14, safety: 3, products: [{ id: 'cable', name: 'Cable', stock: 10, sold: 60, incoming: 0, cost: 350 }] };
describe('Reorder safety', () => {
 it('validates input and rejects negative quantities', () => { expect(reorderInput.safeParse(input).success).toBe(true); expect(reorderInput.safeParse({ ...input, products: [{ ...input.products[0], sold: -1 }] }).success).toBe(false); });
 it('keeps only supplied products, removes duplicates and rounds quantity', () => { const out = normalizeReorder({ summary: 'Advice', recommendations: [{ id: 'cable', quantity: 37.2, reason: 'Demand' }, { id: 'unknown', quantity: 5, reason: 'Invalid' }, { id: 'cable', quantity: 6, reason: 'Duplicate' }] }, input); expect(out.recommendations).toEqual([{ id: 'cable', quantity: 38, reason: 'Demand' }]); });
 it('never produces negative or infinite orders', () => { const out = normalizeReorder({ summary: '', recommendations: [{ id: 'cable', quantity: Infinity, reason: '' }] }, input); expect(out.recommendations[0]?.quantity).toBe(0); });
});
