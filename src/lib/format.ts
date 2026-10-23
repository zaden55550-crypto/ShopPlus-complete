/** Shared number cleanup: tiny or negative-zero values always display as 0. */
export const clean = (n: number): number => (!Number.isFinite(n) || Math.abs(n) < 0.005 ? 0 : n);
