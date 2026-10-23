# SHOPBOOK updates

- [x] Add Settings → General → Sample Data; phone walkthrough loaded 25 products in isolated test storage; four tests verify confirmation and existing-record protection.
- [ ] Complete the supplied Business Profile spec: searchable currency, global monetary precision, prefilled registration phone and remaining tablet/wide-layout checks.

- [x] Match page typography to POS and add products by tapping rows in POS/Sales/Inventory. Editable line amounts verified through saved Inventory-to-Sales drafts and a completed isolated test sale: payment/receipt 185.50, stock deducted once, default product price unchanged, override audited; 9 automated tests pass and phone/desktop checked. Real records untouched.

- [x] Match Sales/POS carts to the supplied quantity-keypad reference; 7 tests pass; verify decimal edits, line totals, saved draft reload, completed sales, receipt and exact stock deductions on a 390px phone in isolated browser storage; preserve amount/price editing and existing ERP records. Unit alternatives await configured conversion rules (only each product's saved unit is available).

- [x] Regroup General settings and verify a persistent whole-app size slider (left larger, right smaller) without changing business records.

- [x] Rebuild Settings around the locked 12-category order, with Import & Data inside General.
- [x] Build supported CSV/XLSX/JSON and image imports with mapping, validation, duplicate review, atomic ERP commit, history, templates and error export.
- [x] Build the one-conversation, session-only Business AI Assistant grounded in the current authorized ERP snapshot.
- [x] Complete the specified compact login/create-account flow, including optional mobile logo crop controls and no login image.
- [ ] Defer broad visual and interaction verification until general system functionality is complete, as requested.
- [x] Historical financial imports go to the Reconciliation app (staged, matched to real records, never double-counted).

- [x] Add compact real-data charts to app Overview screens, Reports and Summary; keep tiny writing and one-row controls.
- [ ] Chart interaction/data verification deferred until general system functionality is finished, at the user's request.

- [x] Build compact Contacts: shared profiles, other contacts, audit and payments.
- [x] Build compact Payroll: employee profiles, compensation, drafts, payments and reports.
- [x] Verify whole-app file backup/restore, preferences and drafts; add automatic Cloud snapshots with truthful status and retries.
- [ ] Verify signed-in Cloud backup and restore end-to-end (blocked: no Cloud auth users; owner must sign in with Google).

- [x] Match Accounting and Float to supplied tiny-writing phone references; verify compact transaction details, shared payment totals, transfers and reasoned cash-up. Cloud sync and staff-authorized corrections remain dependent on the deferred online-account work; purchase VAT remains unavailable.

- [x] Match all Inventory screens to the approved navy/green mockup; preserve shared ERP records and verify the main flows.

- [x] Build and verify Dashboard with the shared five-metric horizontal KPI row.

- [x] Use the supplied dark ShopBot art in light mode.
- [x] Center uploaded shop photos.
- [x] Improve spacing between app rows.
- [x] Rebuild and verify the subscription and payment screens.
- [x] Verify mobile light and dark modes and metadata.
- [x] Show every supplied app icon at its full proportions with a clear theme-aware name.
- [x] Translate login, signup and plans and synchronize all language selectors.
- [x] Set the support phone to 0722288012.
- [x] Use the new dark icons and enlarge icons with names in both themes.
- [x] Verify language persistence, account flow and both themes.- [x] Phase 2.1 ERP core engine (device-local) + Phase 2.2 Inventory app
- [x] Phase 2.3 Sales & POS (shared selling engine, cart, payments, receipts, returns, customers, cash-up)
- [ ] Seller permissions (needs staff accounts)
- [x] Translate all working ERP screens in ten languages (Inventory, Sales, POS and POS Cash; Purchases/Float are not implemented)
- [x] Enforce compact one-row KPIs globally with shared components
- [x] Add and verify AI reorder recommendations from supplied sales/stock data (Inventory → Reports → AI Reorder)
- [x] Phase 2.9 Returns: return status per sale, returns KPI row, commission adjustment on return (purchase returns and supplier refunds wait for Purchases; mixed refunds pending)
- [x] Phase 2.10 Payroll: employees, salary/commission rules, seller at checkout, payroll runs, partial payments (product-specific rules, payroll accounting entries and staff permissions pending)
- [x] Phase 2.11 Reports: overview, sales, inventory, returns, commission, builder with date range, saved reports, CSV export (charts/PDF pending)
- [x] Phase 2.12 Summary: periods, business/sales/inventory/financial position/trends, needs attention (purchases/expenses/payables wait for those apps)
- [x] Phase 2.13 Dashboard: sales breakdown pie, money row, needs attention row
- [x] Phase 2.14 Settings: collapsible sections for general, business, users, features, numbering, data, subscription (payment/payroll/notification/printing/integration settings pending)
- [x] Phase 2.15 Backup: download/restore a validated backup file, audit log view (real staff logins, roles, cloud backup and sync need online accounts — pending)
- [x] Purchases (supplier bills, stock receiving, supplier payments, purchase returns) and Expenses (categories, periods)
- [x] Contacts (customers, suppliers, statements) and Float (live Cash/M-Pesa/Bank, deposits, withdrawals, transfers)
- [x] Accounting: automatic journal, profit & loss, balance sheet, trial balance
- [x] Real camera barcode scanning on all phones, with permission-denied fallback
- [ ] Online accounts, staff roles and multi-device sync (user chose to wait)

- [x] ShopBot name + supplied ShopBot/Inventory icons; bigger Inventory icon; Somali language; one-column card-boxed Settings; Delete & Reset in Settings → General.
- [ ] Staff logins (sellers see only sales, customers, payments; no buying prices/purchases) — needs owner decision on how staff sign in.

- [ ] Reconciliation walk-through — waiting on a transaction-level CSV (the uploaded file is a dashboard summary).
- [x] Live online sync of the whole shop between phones signed in with the same Google account, with live status.
- [x] One 30-day trial per shop (reopening plans no longer restarts it).
- [x] Login/signup tested end-to-end: create account -> plans -> free trial -> apps; login by shop name or phone -> apps; wrong password rejected; signed-out /apps redirects to login. No loop found.

- [x] Rename the assistant to ShopBot everywhere (AI Setup row, header, button label); colours and icons unchanged.
- [x] Renamed the chatbot icon files to Shopbot (green artwork re-saved as Shopbot_Dark_Green); duplicates removed, Apps screen icons verified loading.
- [x] Re-drew both ShopBot icon artworks so the word baked into the artwork reads "ShopBot" instead of "chatbot" (same black speech bubble, same green seven-petal emblem, same colours); Apps screen re-checked in the preview.

## Universal Import Center
- [x] Phase 1: Opening balances (cash, M-Pesa, bank, receivables, payables) — multi-file/sheet, mapping, validation, duplicate-safe, history, export/re-import
- [x] Phase 2: Grouped sales & purchases with line items and payments
- [ ] Phase 3: Returns, stock movements, payroll, float history; retire legacy importer

## Offline resilience
- [x] Online / Connecting / Offline buttons in Apps header with backend health check + details panel
- [x] Admin outage announcements (server-stored, cached locally)
- [x] Announcement tests
- [ ] Full offline outbox for every money action (ERP already saves on-device first; needs server-side idempotent writes)
