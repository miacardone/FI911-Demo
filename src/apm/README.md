# APM — Alternative Payment Methods

The earlier console is not an archive any more. It is a second product in the
app, at **`/apm`**, and it lives at **`src/apm/`**.

Reach it from the last item in the rail. It gets its own rail, its own
breadcrumb root, and a chip reading "Alternative Payment Methods" so it is
always clear which product you are in.

## What it is

Bank-to-bank payments, in GBP:

- Participants: Invitations, Applications, Underwriting, Onboarding, Live
  Participants — PSPs and banks, not merchants
- Customer Services: ERT
- Residuals: all eight, including Trending Report
- Disputes: APP-claim disputes, Chargebacks & Alerts
- Risk Management: Dashboard, Merchants, Alert Action, Merchant Risk Profile,
  Held Volume, Rules, and the three queues
- Transactions: all nine, including Account Holder, Gateway, Funding Category
- Reports, Billing, Document Center, Setup

The card-acquiring console at `/` is the other product: merchants, MIDs, MCCs
and card-scheme chargebacks, in US dollars.

## Why the two do not share a data layer

`src/apm/` carries its own `data/`, `domain/`, `pages/`, `navigation.js` and
`brand.config.js`. It imports the shared shell — components, hooks, styles,
context — and nothing else.

A "participant" here is not a "merchant" there. APM's disputes are FCA consumer
categories; acquiring's are Visa and Mastercard reason codes. Sharing a brand
config would mean one product silently relabelling the other's book the day
someone edited it. Two payment rails with genuinely different vocabulary
should not share a vocabulary file.

The practical consequence: changes to the acquiring console do not reach
`/apm`, and they are not supposed to. Do not "tidy" `src/apm/brand.config.js`
into the other one.

## Moving a page between them

Copy it across, repoint its `@/apm/...` imports, and add its route and nav
entry. Expect to reconcile the data model by hand — the two sides mean
different things by the same words.
