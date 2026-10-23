import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** All SHOPBOOK summary metrics share one compact, non-wrapping strip. */
export function KpiRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("kpi-row", className)}>{children}</div>;
}

export function Kpi({ label, value, tone, icon }: { label: string; value: ReactNode; tone?: "warn" | "bad" | undefined; icon?: ReactNode }) {
  return <div className="kpi-item">{icon && <span className="kpi-icon">{icon}</span>}<div className="min-w-0"><p className="whitespace-nowrap text-[10px] font-semibold uppercase text-muted-foreground">{label}</p><p className={cn("mt-1 whitespace-nowrap text-sm font-bold tabular-nums", tone === "warn" && "text-warning", tone === "bad" && "text-destructive")}>{value}</p></div></div>;
}