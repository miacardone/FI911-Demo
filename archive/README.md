# Archive

Pages taken **off the demo** but kept in the repo. Nothing here is deleted and
nothing here is built.

## Why this folder works

Vite only compiles what `index.html` reaches through `src/`, and the lint
script targets `src` only (`eslint src --ext .js,.jsx`). A file sitting in
`archive/` is therefore inert — it ships in no bundle, it fails no lint, and it
costs nothing — while staying in version control where a normal `git mv` brings
it straight back.

The files are unmodified. Their `@/...` imports still resolve, because `@` maps
to `/src` and every module they depend on is still there.

---

## `eric-only/` — removed 2026/08/24

Eric's page list and Clive's page list overlap heavily. These are the pages
that appear in **Eric's list only**, with no counterpart in Clive's under any
name. Everything Clive needs stayed, including the pages the two demos call by
different names.

| Page | Route it used to serve |
|---|---|
| Merchants › Onboarding | `/merchants/onboarding` (was `/participants/onboarding`) |
| Participants › Onboarding detail | `/merchants/onboarding/:id` |
| Residuals › Trending Report | `/residuals/trending-report` |
| Risk › Dashboard | `/risk/dashboard` |
| Risk › Merchants | `/risk/merchants` |
| Risk › Alert Action | `/risk/alert-action` |
| Risk › Merchant Risk Profile | `/risk/merchant-risk-profile` |
| Risk › Held Volume | `/risk/held-volume` |
| Transactions › Account Holder | `/transactions/account-holder` |
| Transactions › Gateway | `/transactions/gateway` |
| Transactions › Funding Category | `/transactions/funding-category` |

### Also changed, without archiving a file

**Risk › Rules** left the main rail but was *not* archived. Clive
lists it under Setup › Risk › Rules Setup, and both entries rendered the same
`src/pages/risk/Rules.jsx`. Only the main-rail route and nav entry went; the
page is still live at `/setup/rules`.

**Two section landings were re-pointed** at pages that still exist:

- `/risk` → Work Queue (was Risk Dashboard)
- `/transactions` → ACH Listings (was Account Holder)

### Kept deliberately — these are Clive's under another name

Worth knowing before anyone "tidies up" further:

| Ours | Clive's list calls it |
|---|---|
These have since been RENAMED to Clive's vocabulary (2026/08/24), so the demo
now reads in his nouns throughout — rail, page titles, column headers, URLs:

| Was | Now |
|---|---|
| Participants › Invitations | Merchants › Proposals |
| Participants › Applications | Merchants › Contracts |
| Participants › Live Participants | Merchants › Live Merchants |
| Customer Services › ERT | Customer Services › Tickets |
| Residuals › General Ledger | Residuals › Payout Splits |
| Residuals › Fee Adjustments | Residuals › Payout Adjustments |
| Residuals › Participant Status | Residuals › Merchant Status |
| Disputes › Disputes | Disputes › Chargebacks |
| Risk Management | Risk |

Component and file names still use the old nouns (`Invitations.jsx`,
`ParticipantStatus.jsx`). That is deliberate — renaming files would have
churned every import for no visible gain, and the route KEYS in
`navigation.js` (`routes.invitations`) are internal identifiers, not copy.

---

## Restoring a page

Three steps, all reversals of what was done:

1. **Move the file back**

   ```bash
   git mv archive/eric-only/pages/risk/HeldVolume.jsx src/pages/risk/
   ```

2. **Re-add its route key** in `src/data/navigation.js` (inside `routes`) and
   its **rail entry** in the matching `nav` group, e.g.

   ```js
   heldVolume: '/risk-management/held-volume',
   ```
   ```js
   { label: 'Held Volume', path: routes.heldVolume, permission: 'Held Volume', area: 'Risk Management', crumb: 'Held Volume' },
   ```

3. **Re-add the import and `<Route>`** in `src/App.jsx`.

Nothing else is needed. Breadcrumbs, the directory search, and Permissions all
derive from `navigation.js`, so they pick the page up as soon as its nav entry
is back.

To restore **everything** at once, the commit that removed them is the fastest
route:

```bash
git log --oneline -- archive/eric-only
git revert <that-commit>
```
