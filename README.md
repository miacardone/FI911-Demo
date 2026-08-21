# Fi911 — Operator Console

A white-label operator console for a UK payments platform: participant
onboarding, residuals, disputes, risk management, transactions and billing.

Built on the same architecture as the Expedia and Nutmeg dispute-console demos,
retargeted to the Fi911 tenant. React 18 + Vite, no UI framework, no chart
library — every component is in this repo.

```bash
npm install
npm run dev      # http://localhost:5173
```

Demo credentials: **`Fi911Demo` / `Changeme123`**

---

## What's in it

39 screens across eight sections, all wired and populated.

| Section | Screens |
| --- | --- |
| **Dashboard** | Operator Summary — active PSPs, onboarding funnel, transaction throughput, dispute book, financial split, ERT trend |
| **Participants** | Invitations, Applications, Underwriting, Onboarding, Live Participants — each with a full detail form, plus Participant Merchants |
| **Customer Services** | ERT Notifications with ticket creation |
| **Residuals** | General Ledger, Fee Adjustments, Trending Report, Agent Payout Summary, Payout Details, Participant Status, Income / Expense, Portfolio Payout Details |
| **Disputes** | Summary / Details / Custom Filter, plus the chargeback detail page |
| **Risk Management** | Risk dashboard, Merchants, Alert Action, Merchant Risk Profile, Held Volume, Rules |
| **Transactions** | Account Holder, Gateway, ACH Listings, Authorizations, Settlements, Funding Category, Funding Deposits, Qualifications, Merchant Reserves |
| **Billing** | Statements |

---

## Architecture

### The white-label rule

`src/brand/brand.config.js` is the single tenant control file — palette,
wordmark, currency, locale, vocabulary, processors, MCCs, feature flags.

**No component hard-codes a colour or a brand name.** Colours reach the DOM as
CSS custom properties written at runtime by `BrandProvider`; nouns reach JSX
through `brand.terms`; the logo reaches the DOM as a *path*, never an import.
`src/styles/tokens.css` carries the same values as static fallbacks so nothing
flashes unstyled on first paint.

Retargeting to another tenant is a change to one file.

### Three shells carry 39 screens

Nearly every screen is one of three shapes, so each shape is built once:

- **`components/fi911/ListPage.jsx`** — page header + Feedback, tab strip with
  counts, scope strip, toolbar (search / Advanced Search / Autosize / Columns /
  Export to Excel), collapsible filter panel, table, pager. Search, sort and
  pagination live here rather than in each caller, so a page module is just its
  columns and its data.
- **`components/fi911/DetailPage.jsx`** — back arrow, title cluster, collapsible
  sections over a two-column field grid, sticky Discard/Save footer.
- **`components/fi911/TransactionPage.jsx`** — the Summary / Details / Custom
  Filter / Historical Records four-tab object all nine Transactions screens use.
  The tab set is derived from which datasets a page actually passes.

Composed sections for the participant agreement live in
`components/fi911/AgreementSections.jsx` — Applications, Onboarding and Live
Participants each pick the blocks they need in their own order rather than
sharing one mega-form behind a dozen `showX` flags.

### Three filter panels, deliberately distinct

`components/fi911/Filters.jsx` — they look similar and do different things:

| Panel | Behaviour | Footer |
| --- | --- | --- |
| Advanced Search | narrows the table in place | Search / Clear |
| Custom Filter | narrows the table **and** is saveable as a named report | Save / Download / Update / Delete, Clear / Apply |
| Historical Records | does **not** filter — emails an archive extract | Clear / Email Report |

### Tab counts are derived, never declared

Each participant stage owns an explicit status → bucket map (`data/participants.js`),
and the tab counts come from running the rows through it. A count can't disagree
with the rows behind it — "Pending (3)" opening onto four rows is unreachable by
construction.

ERT is the deliberate exception: its tabs *overlap* (a ticket can be In Progress
**and** Over Due **and** Assigned), so those counts sum to more than the total.
Each ERT tab is an independent predicate rather than a bucket lookup.

### Rule descriptions are templates

Risk rules store their prose with `{parameter_1}` / `{parameter_2}` tokens and
their thresholds in separate fields. The grid renders the sentence with live
values highlighted, and the editor previews the substitution as you type — so
changing a threshold updates every place the number appears, rather than leaving
the description describing the old value.

### Deterministic data

`data/rng.js` is a seeded mulberry32 PRNG. Large grids (264 trending rows, 110
disputes, 100 portfolio payouts) are generated with a fixed seed, so the figures
are identical on every reload — a demo whose numbers move between refreshes
reads as broken. The participant funnel is written out by hand instead, because
it is the narrative spine: the same institutions have to reappear at the right
stage with the right agent.

"Today" is pinned to `2026/08/20` in `brand.config.js`, so every seeded date,
range chip and "Last calculated on" label lines up.

---

## Layout

```
src/
├── brand/            tenant config, provider, wordmark
├── components/
│   ├── ui/           DataTable, Form, Modal, Overlay, Surface, Icon
│   ├── charts/       hand-rolled SVG: bar (stacked + grouped), area, line, donut, bar rows
│   ├── layout/       white rail, blue topbar, black breadcrumb strip
│   └── fi911/        ListPage, DetailPage, TransactionPage, Filters, cells, modals
├── data/             reference data + one module per domain
├── domain/           status vocabulary and tone resolution
├── pages/            39 screens, grouped by section
├── styles/           tokens.css, base.css, components.css
└── utils/            format, export, storage
```

## Notes

- Session is held in `sessionStorage`, so a refresh doesn't bounce you to login.
- The sticky Save footer on detail pages appears only once the form is dirty —
  a deliberate departure from the reference, where you must scroll past the
  whole pricing table to reach Save.
- Breadcrumbs derive from the URL (`data/navigation.js`); detail pages push a
  single record label up through context. No page declares its own trail.
- `npm run build` is clean; all 40 routes render without console errors.
