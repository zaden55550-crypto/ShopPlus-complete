import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ShopButton } from "@/components/ui/shop-button";
import { useErp } from "@/components/shopbook/product-search";
import { isDemo, isEmptyShop, loadDemoData } from "@/lib/demo";

export function SampleData({ tr, shopName }: { tr: (s: string) => string; shopName: string }) {
  useErp();
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const demo = isDemo(), empty = isEmptyShop();
  const loadSample = () => {
    if (busy || !confirmed) return;
    setBusy(true);
    try {
      loadDemoData();
      toast.success(tr("Sample data loaded. Your test shop is ready."));
      setOpen(false);
      setConfirmed(false);
    } catch (e) {
      toast.error(tr(e instanceof Error ? e.message : "Sample data could not be loaded"));
    } finally { setBusy(false); }
  };
  return <div className="import-center">
    <p className="settings-note" role="status">{tr(demo ? "Sample data is already loaded in this shop." : !empty ? "Sample data can only be loaded into an empty test shop. Existing records are kept." : "Sample products, sales, purchases and payments will be added to this shop. Use a test shop, not a real business.")}</p>
    <ShopButton className="inventory-save" disabled={busy || demo || !empty} onClick={() => { setConfirmed(false); setOpen(true); }}><FlaskConical className="h-4 w-4" />{tr("Load sample data")}</ShopButton>
    <AlertDialog open={open} onOpenChange={(value) => { if (!busy) setOpen(value); }}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{tr("Load sample data")}</AlertDialogTitle><AlertDialogDescription>{shopName} — {tr("This adds fictional business records to the current shop. If Cloud sync is connected, these records may also appear on your other devices. Your shop name and settings will stay unchanged.")}</AlertDialogDescription></AlertDialogHeader>
        <label className="settings-toggle"><span>{tr("This is an empty test shop, not my real business")}</span><input type="checkbox" checked={confirmed} disabled={busy} onChange={(e) => setConfirmed(e.target.checked)} /></label>
        <AlertDialogFooter><AlertDialogCancel disabled={busy}>{tr("Cancel")}</AlertDialogCancel><AlertDialogAction disabled={!confirmed || busy} onClick={(e) => { e.preventDefault(); loadSample(); }}>{tr(busy ? "Loading…" : "Confirm load sample data")}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}