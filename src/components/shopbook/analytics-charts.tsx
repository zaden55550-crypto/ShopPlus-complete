import { clean } from "@/lib/format";
import { useId, useState } from "react";
import { Area, Bar, CartesianGrid, ComposedChart, Legend, Line, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ShopButton } from "@/components/ui/shop-button";
import { chartBreakdown, chartSeries, type ChartPoint, type ChartModule, type ChartRange, type ChartGroup } from "@/lib/chart-data";
import type { ErpState } from "@/lib/erp";

const COLORS = ["var(--success)", "var(--primary)", "var(--warning)", "var(--destructive)", "var(--muted-foreground)"];
const short = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
type Props = { points: ChartPoint[]; money: (n: number) => string; tr: (s: string) => string; title: string; labels?: string[] | undefined; kind?: "line" | "bar" | "donut" | "ranking"; count?: boolean };

export function CompactGraph({ points, money, tr, title, labels = [title], kind = "line", count }: Props) {
  const id = useId().replace(/:/g, "");
  const fmt = count ? (v: number) => clean(v).toLocaleString("en-KE") : money;
  const hasData = points.some((p) => p.value !== 0 || (p.secondary ?? 0) !== 0 || (p.third ?? 0) !== 0);
  const breakdown = kind === "donut" || kind === "ranking";
  const nonzero = points.filter((p) => p.value !== 0);
  // Negative balances are not meaningful pie slices; retain them in a signed ranking.
  const donut = kind === "donut" && nonzero.every((p) => p.value > 0);
  return <section className="shop-chart-section" aria-label={tr(title)}>
    <h2 className="shop-chart-title">{tr(title)}</h2>
    {!hasData ? <p className="shop-chart-empty">{tr("No records in this period")}</p> : breakdown ? <div className={donut ? "shop-chart-breakdown" : "min-w-0"}>
      {donut && <div className="shop-chart-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={nonzero} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="95%" paddingAngle={2} isAnimationActive={false}>{nonzero.map((p, i) => <Cell key={p.label} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", color: "var(--foreground)", fontSize: 10 }} /></PieChart></ResponsiveContainer></div>}
      <div className="shop-chart-ranking">{nonzero.slice(0, 8).map((p, i) => { const total = nonzero.reduce((a, x) => a + Math.abs(x.value), 0); const percentage = total ? Math.abs(p.value) / total * 100 : 0; return <div className="shop-chart-rank" key={p.label} title={`${tr(p.label)} · ${fmt(p.value)}`}><span className="truncate">{tr(p.label)}</span><b className={p.value < 0 ? "text-destructive" : ""}>{fmt(p.value)}</b><span className="shop-chart-track"><span style={{ width: `${percentage}%`, background: COLORS[i % COLORS.length] }} /></span><span className="text-muted-foreground">{Math.round(percentage)}%</span></div>; })}</div>
    </div> : <div className="shop-chart-plot"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={points} margin={{ top: 6, right: 7, left: -15, bottom: 0 }} accessibilityLayer>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--success)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--success)" stopOpacity={0.02} /></linearGradient></defs>
      <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
      <XAxis dataKey="label" tick={{ fontSize: 8, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} minTickGap={25} />
      <YAxis tickFormatter={short} tick={{ fontSize: 8, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={47} />
      <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", color: "var(--foreground)", fontSize: 10 }} labelStyle={{ color: "var(--foreground)" }} />
      {labels.length > 1 && <Legend iconSize={6} wrapperStyle={{ fontSize: 8 }} />}
      {kind === "bar" ? <Bar dataKey="value" name={tr(labels[0] ?? title)} fill="var(--success)" maxBarSize={18} isAnimationActive={false} /> : <Area type="monotone" dataKey="value" name={tr(labels[0] ?? title)} fill={`url(#${id})`} stroke="var(--success)" strokeWidth={1.7} isAnimationActive={false} />}
      {labels[1] && (kind === "bar" ? <Bar dataKey="secondary" name={tr(labels[1])} fill="var(--destructive)" maxBarSize={18} isAnimationActive={false} /> : <Line type="monotone" dataKey="secondary" name={tr(labels[1])} stroke="var(--destructive)" strokeWidth={1.5} dot={false} isAnimationActive={false} />)}
      {labels[2] && <Line type="monotone" dataKey="third" name={tr(labels[2])} stroke="var(--primary)" strokeWidth={1.5} dot={false} isAnimationActive={false} />}
    </ComposedChart></ResponsiveContainer></div>}
  </section>;
}

const TITLES: Record<ChartModule, string> = { sales: "Sales trend", purchases: "Purchase trend", expenses: "Expense trend", financial: "Revenue, expenses & profit", inventory: "Stock movement", contacts: "New contacts", returns: "Returns trend", commission: "Commission trend", payroll: "Payroll trend", float: "Money movement" };
export function ModuleCharts({ s, module, money, tr, from = 0, to = Date.now(), single = false, group }: { s: ErpState; module: ChartModule; money: (n: number) => string; tr: (s: string) => string; from?: number; to?: number; single?: boolean; group?: ChartGroup }) {
  const range = { from, to };
  const series = chartSeries(s, module, range, group);
  const by = chartBreakdown(s, module, range);
  const labels = module === "financial" ? ["Revenue", "Expenses", "Profit"] : module === "inventory" ? ["In", "Out"] : module === "float" ? ["Money in", "Money out"] : module === "payroll" ? ["Payroll", "Paid"] : module === "returns" ? ["Sales returns", "Purchase returns"] : undefined;
  return <><CompactGraph title={TITLES[module]} points={series} money={money} tr={tr} labels={labels} count={module === "inventory" || module === "contacts"} kind={["expenses", "inventory", "returns", "float", "payroll"].includes(module) ? "bar" : "line"} />{!single && <CompactGraph title={by.title} points={by.points} money={money} tr={tr} kind={["sales", "purchases", "expenses"].includes(module) ? "donut" : "ranking"} />}</>;
}

export type AnalyticsPeriod = "Today" | "This Week" | "This Month" | "This Year" | "Custom";
export const ANALYTICS_PERIODS: AnalyticsPeriod[] = ["Today", "This Week", "This Month", "This Year", "Custom"];
export const localIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function analyticsRange(period: AnalyticsPeriod, custom: [string, string]): ChartRange {
  const now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "This Week") start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  if (period === "This Month") start.setDate(1);
  if (period === "This Year") { start.setMonth(0); start.setDate(1); }
  if (period === "Custom") { const from = new Date(`${custom[0]}T00:00:00`).getTime(), to = new Date(`${custom[1]}T23:59:59.999`).getTime(); return { from: Number.isFinite(from) ? from : start.getTime(), to: Number.isFinite(to) ? to : now.getTime() }; }
  return { from: start.getTime(), to: now.getTime() };
}
export function PeriodFilter({ period, setPeriod, custom, setCustom, tr, dropdown = false }: { period: AnalyticsPeriod; setPeriod: (p: AnalyticsPeriod) => void; custom: [string, string]; setCustom: (p: [string, string]) => void; tr: (s: string) => string; dropdown?: boolean }) {
  return <div className="shop-chart-filters">{dropdown ? <select className="inventory-input" aria-label={tr("Period")} value={period} onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}>{ANALYTICS_PERIODS.map((p) => <option key={p} value={p}>{tr(p)}</option>)}</select> : ANALYTICS_PERIODS.map((p) => <ShopButton key={p} variant="bare" className="inventory-tab" aria-pressed={p === period} onClick={() => setPeriod(p)}>{tr(p)}</ShopButton>)}{period === "Custom" && <><input type="date" className="inventory-input" aria-label={tr("From")} value={custom[0]} onChange={(e) => setCustom([e.target.value, custom[1]])} /><input type="date" className="inventory-input" aria-label={tr("To")} value={custom[1]} onChange={(e) => setCustom([custom[0], e.target.value])} /></>}</div>;
}