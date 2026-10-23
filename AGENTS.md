<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep SHOPBOOK plan pricing and entitlement data centralized in `src/lib/shopbook.ts` so selection and access stay consistent.

- Use the shared useLanguage hook for interface language across pre-login and account screens; persist choices separately from accounts to keep selectors synchronized.
- Keep additional interface translations in interface-translations.ts and existing keyed app translations in i18n.ts; translate plan presentation without changing centralized entitlement data.
- All business data flows through the transaction engine in `src/lib/erp.ts` (`commit` = validate-then-save atomically); stock only changes via recorded movements, for one audited source of truth.
- Sales, POS and Inventory reuse CartSheet and the quantity keypad; Inventory uses the Sales draft/Checkout. Drafts never change records. Manual amounts derive audited one-sale price overrides.
- Use the shared KpiRow and Kpi components for all summary metrics so every app obeys the global non-wrapping strip rule.
- Scope Inventory's approved theme and compact control styles to its screen so other apps retain their shared theme; reuse the shared KPI and transaction components to prevent divergence.
- Dashboard reads the shared ERP snapshot without mutations; unavailable financial sources stay unset rather than presenting fabricated totals.
- Reorder AI is server-only, needs Cloud identity, and is advisory (never mutates ERP).
- Commission is a ledger in the ERP state: returns append negative adjustment rows instead of editing earned rows, so history stays auditable.
- Commission rows record per-product amounts; returns reverse from those (legacy rows fall back).
- Reports (`src/lib/reports.ts`) are read-only builders over the ERP snapshot; sources that don't exist yet return null and render as a dash.
- Purchases, expenses, supplier payments and float moves are signed rows in the shared `payments` ledger (`src/lib/finance.ts`), so Float, POS cash-up and Accounting read one money source.
- Accounting (`src/lib/accounting.ts`) is a read-only double-entry journal derived from ERP records; never store separate ledger rows that could drift.
- Demo seed uses public ERP actions; Settings requires test-shop confirmation and execution-time emptiness checks; resets require demo flags, protecting real records.
- Support chat is in Cloud: owners use Google sign-in, AI replies only from the server route, support role (user_roles) gates /support-inbox.
- Purchase drafts are device-local unsaved work (not ERP records); only confirmed purchases go through finance.ts so stock, money and supplier balances change once.
- Part payments (P.PAY) go in a separate settled amount; the original pay split stays untouched to avoid double counting. Purchases and Sales share erp-shell.tsx.
- All printing goes through PrintPreview (src/components/shopbook/print.tsx): white preview, always-working Exit, timeout to a failure state, and no false 'Printed' claim because browsers can't confirm paper output. Expense paid/balance is derived from EXPENSE ledger rows, never stored.
- Every money screen picks payment with the shared PayPicker (Cash, M-Pesa, Bank, Credit, P.PAY last); unpaid remainder always lands on credit. Device prefs (interface size, VAT) live in src/lib/prefs.ts; sale VAT is stored on the sale and posted to VAT payable.
- General and Appearance share the same whole-interface size control backed by prefs.ts; reuse uniform zoom so text, icons and controls scale together without changing ERP records.
- Accounting and Float share the ERP shell and money-ui controls; money-activity builds read-only financial documents and actual account movements separately to prevent double-counting.
- Cash-up goes through the shared ERP cashUp action (one history for POS and Float).
- Cloud backup mounts once at root; per user/device with revision checks; restore is explicit.
- Backups are whole-ERP JSON (plus allowlisted Settings/import history), exclude passwords/sessions/entitlements, and restore validates atomically with rollback.
- Contacts/Payroll share ERP shell and people actions; settlements atomic; employees separate from contacts.
- Charts use read-only chart-data/accounting series shared by overviews, Reports and Summary.
- Settings: 12 ordered categories; imports use one atomic commit. Business AI is read-only, session-only, server-side.
- Phone sync: one row per owner; ERP merged by record id with revision-checked writes so concurrent saves never overwrite.
- Resets stamp `seq['__reset:<collection>']`; sync merge drops older records so a stale phone can't restore deleted data.
- Opening balances import as OPENING rows in the payments ledger with an importKey (src/lib/opening-import.ts), so they never count as sales/expenses and re-imports never double-post.
- Full import (src/lib/full-import.ts) only orchestrates category importers; preview runs then restores a snapshot, confirm is all-or-nothing.
- Connection status (src/components/shopbook/connection-status.tsx) uses a backend health check, not navigator.onLine alone; system announcements are server rows writable only by the support role and cached on-device for outages.
