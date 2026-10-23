import type { ErpState } from "@/lib/erp";
import { purchaseTotals } from "@/lib/finance";
import { profitAndLoss } from "@/lib/accounting";

/** Read-only summary over the shared ERP records. */
export function dashboardTotals(s: ErpState) {
  const sales = s.sales.reduce((sum, sale) => sum + sale.total, 0)
    - s.returns.reduce((sum, ret) => sum + ret.amount, 0);
  const stock = s.products.reduce((sum, product) => sum + product.qty * product.buy, 0);
  const t = purchaseTotals(s);
  return { sales, purchases: t.purchases, expenses: t.expenses, profit: profitAndLoss(s).net, stock };
}
