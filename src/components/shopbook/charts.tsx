import { Title, type Tr } from "@/components/shopbook/selling";
import { Kpi, KpiRow } from "@/components/shopbook/kpi";
import type { position } from "@/lib/summary";
import { METHODS, METHOD_LABEL, type Method } from "@/lib/erp";

const COLORS: Record<Method, string> = { cash: "var(--primary)", mpesa: "var(--success, oklch(0.7 0.17 150))", bank: "var(--warning, oklch(0.8 0.15 80))", credit: "var(--destructive)" };

/** Single pie of sales by payment method. */
export function MethodPie({ by, money, tr }: { by: Record<Method, number>; money: (n: number) => string; tr: Tr }) {
  const total = METHODS.reduce((a, m) => a + by[m], 0);
  let acc = 0;
  const stops = METHODS.map((m) => { const s = acc; acc += total ? (by[m] / total) * 360 : 0; return `${COLORS[m]} ${s}deg ${acc}deg`; }).join(", ");
  return (
    <div className="flex items-center gap-4">
      <div aria-hidden className="h-24 w-24 shrink-0 rounded-full border border-border" style={{ background: total ? `conic-gradient(${stops})` : "var(--muted)" }} />
      <ul className="min-w-0 flex-1 space-y-1 text-xs">
        {METHODS.map((m) => <li key={m} className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[m] }} /><span className="flex-1 first-letter:uppercase">{tr(METHOD_LABEL[m])}</span><b className="tabular-nums">{money(by[m])}</b></li>)}
      </ul>
    </div>
  );
}

export function TrendBars({ data, money }: { data: { day: number; value: number }[]; money: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-32 items-end gap-1">
      {data.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${new Date(d.day).toLocaleDateString("en-GB")} • ${money(d.value)}`}>
          <div className="w-full rounded-t bg-primary" style={{ height: `${Math.max(2, (Math.max(0, d.value) / max) * 100)}px` }} />
          <span className="text-[9px] text-muted-foreground">{new Date(d.day).getDate()}</span>
        </div>
      ))}
    </div>
  );
}

export function NeedsAttention({ pos, money, tr }: { pos: ReturnType<typeof position>; money: (n: number) => string; tr: (t: string) => string }) {
  return (<>
    <Title>{tr("Needs attention")}</Title>
    <KpiRow>
      <Kpi label={tr("Low stock")} value={pos.low + pos.out} tone={pos.low + pos.out ? "warn" : undefined} />
      <Kpi label={tr("Receivables")} value={money(pos.receivables)} />
      <Kpi label={tr("Payables")} value={money(pos.payables)} tone={pos.payables > 0 ? "warn" : undefined} />
      <Kpi label={tr("Cash-up")} value={tr(pos.cashUpPending ? "Pending" : "Done")} tone={pos.cashUpPending ? "warn" : undefined} />
    </KpiRow>
  </>);
}
