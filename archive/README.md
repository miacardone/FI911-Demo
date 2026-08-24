# Archive

## Eric's console has moved into the app

It is no longer a folder of dormant files. The whole of Eric's demo now lives
at **`src/eric/`** and is reachable in the running app at **`/eric`** — same
shell, its own rail, marked "ERIC — ARCHIVED DEMO", with a "Back to console"
item to leave it.

That is a better archive than a folder nobody can run: the pages are
demonstrable, not just recoverable.

### What is in it

Eric's complete product as of 2026/08/24 — a UK bank-to-bank participant
console in GBP:

- Participants: Invitations, Applications, Underwriting, **Onboarding**, Live
  Participants
- Customer Services: ERT
- Residuals: all eight, including **Trending Report**
- Disputes: APP-claim disputes, Chargebacks & Alerts
- Risk Management: **Dashboard, Merchants, Alert Action, Merchant Risk
  Profile, Held Volume**, Rules, and the three queues
- Transactions: all nine, including **Account Holder, Gateway, Funding
  Category**
- Reports, Billing, Document Center, Setup

The bold ones are the pages the live console no longer has at all.

### Why it is a full copy rather than a shared one

`src/eric/` carries its own `data/`, `domain/`, `pages/`, `navigation.js` and
`brand.config.js`. It imports the shared shell — components, hooks, styles,
context — but none of the live console's data or vocabulary.

That isolation is the whole point. The live console moved to a
merchant-acquiring model in US dollars; Eric's depends on PSP/Bank participant
types, FCA consumer dispute categories and GBP. Had it kept importing the live
brand config, his book would have silently re-labelled itself with
card-scheme reason codes the day that file changed. **An archive that drifts
with the thing it archives preserves nothing.**

The practical consequence: changes to the live console do not reach `/eric`,
and they are not supposed to. Do not "tidy" `src/eric/brand.config.js` into
the live one.

### Restoring a page to the live console

Copy it out of `src/eric/pages/`, repoint its `@/eric/data/...` imports at
`@/data/...`, and add its route and nav entry as normal. Expect to reconcile
the data model by hand — Eric's rows are participants and APP claims, the live
console's are merchants and card chargebacks.

Git history remains the other route: `git log --oneline -- src/eric` and the
commits before 2026/08/24 hold every earlier state.
