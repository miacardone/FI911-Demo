/**
 * MERCHANTS — the boarding funnel.
 *
 * Four stages, each its own list screen: Proposals → Contracts →
 * Underwriting → Live Merchants.
 *
 * These rows are written out rather than generated. Everything else in this
 * console is seeded from rng.js, but the funnel is the demo's narrative spine:
 * the same merchants have to reappear at the right stage with the right agent
 * and contact, and a merchant mid-underwriting on one screen must be live on
 * another. A generator would produce plausible rows that told no story.
 *
 * Every row carries what an acquirer actually boards on — DBA name, MID once
 * one exists, MCC, processor, monthly volume — because those are the fields
 * the decision is made from. A funnel that only carries a company name and a
 * status is a to-do list, not an underwriting queue.
 *
 * TAB COUNTS ARE DERIVED, NOT DECLARED. Each stage owns an explicit
 * status → bucket map (`*_STATUS`) and the tab counts come from running the
 * rows through it. That is why a count can never disagree with the rows behind
 * it — the failure mode where "Pending (3)" opens onto four rows is
 * unreachable by construction. Keyword-guessing the bucket from the status
 * text was the alternative and it breaks on real pairs like "eSign Completed"
 * (in progress) versus "Contract Completed" (closed).
 */

import { CONTACTS } from '@/data/people';
import { createDraw } from '@/data/rng';
import { midFor } from '@/data/reference';
import brand from '@/brand/brand.config';

/**
 * Merchant attributes, derived from the trading name.
 *
 * Deriving rather than declaring keeps the same merchant identical wherever it
 * appears — the MID on the Proposals screen is the MID on Live Merchants — and
 * it means adding a row to the funnel does not mean hand-writing six more
 * fields that have to stay consistent with each other.
 *
 * `boarded` decides whether a MID exists at all: a proposal has no MID, and
 * showing a blank there is the honest answer rather than inventing one.
 */
export function merchantFacts(name, { boarded = false } = {}) {
  const d = createDraw(name.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7));
  const mcc = d.pick(brand.mccs);

  /* HOW THE MERCHANT GOT HERE — the same record, two intake paths.
     `bank` means the acquiring bank (or one of its partners) boarded them:
     an agent owns the relationship and an underwriter keys the application
     from documents the merchant hands over. `self` means the merchant signed
     itself up through the web form: nobody owns the relationship, the figures
     are self-declared until verified, and identity has to be proven
     electronically rather than by a person looking at a passport.

     This is not cosmetic. It changes which fields exist, which are trusted,
     and how much underwriting work a record needs — so it belongs on the
     record rather than being inferred from whether `agent` happens to be set. */
  const intake = d.weighted([['bank', 7], ['self', 3]]);
  const selfServed = intake === 'self';

  return {
    dbaName: name,
    legalName: `${name.replace(/ (LLC|Inc|Co|Ltd)$/, '')} LLC`,
    mid: boarded ? midFor(name, 14) : '',
    mcc: mcc.code,
    mccLabel: mcc.label,
    merchantType: d.pick(brand.participantTypes).label,
    processor: d.pick(brand.processors),
    monthlyVolume: d.money(4_800, 420_000),
    averageTicket: d.money(18, 640),
    riskTier: d.weighted([['low', 6], ['medium', 3], ['high', 1]]),

    intake,
    intakeLabel: selfServed ? 'Self-service' : 'Bank-boarded',
    /* Where a self-service signup came from. Blank for bank-boarded, because
       the answer there is "an agent", which the agent column already says. */
    signupSource: selfServed ? d.pick(['Web signup', 'Partner referral link', 'Mobile app', 'Embedded checkout']) : '',
    /* Self-declared until someone checks it. A bank-boarded application has
       had bank statements read against it; a self-service one has not, which
       is exactly the distinction underwriting needs to see. */
    volumeVerified: !selfServed,
    /* Self-service proves identity electronically; bank-boarded does it with
       a person and a document. */
    identityMethod: selfServed ? d.pick(['Electronic KYC', 'Open banking match', 'Micro-deposit']) : 'Documentary review',
    emailVerified: selfServed ? d.bool(0.85) : true,
    bankVerified: selfServed ? d.bool(0.6) : true,
    /* How many of the standard document set are on file. A self-service
       merchant typically uploads fewer, which is the follow-up work. */
    documentsOnFile: selfServed ? d.int(1, 3) : d.int(4, 6),
  };
}

/** The two intake routes, for filters and pickers. */
export const INTAKE_ROUTES = [
  { id: 'bank', label: 'Bank-boarded', help: 'Boarded by the acquiring bank or one of its partners. An agent owns the relationship and underwriting keys the application from documents.' },
  { id: 'self', label: 'Self-service', help: 'The merchant signed itself up. Figures are self-declared until verified and identity is proven electronically.' },
];

export const intakeMeta = (id) => INTAKE_ROUTES.find((r) => r.id === id) ?? INTAKE_ROUTES[0];

/**
 * Build a funnel row: derived merchant facts, then the row's own fields.
 *
 * A self-service signup has no agent by definition — nobody introduced them.
 * The seed rows all name one, so it is cleared here rather than in eight
 * places; leaving it would have the Source column say "Self-service" while
 * the Agent column named the person who supposedly brought them in.
 */
const funnelRow = (r, opts) => {
  const facts = merchantFacts(r.merchant, opts);
  const row = { ...facts, ...r };
  return facts.intake === 'self' ? { ...row, agent: '' } : row;
};

/* ------------------------------------------------------------------ *
 * Status catalogues — label → lifecycle bucket
 * ------------------------------------------------------------------ */

export const INVITATION_STATUS = {
  'New Lead': 'new',
  Assigned: 'assigned',
  'WIP Lead': 'in_progress',
  'Pending Review': 'pending',
  'Dead Lead': 'closed',
};

export const APPLICATION_STATUS = {
  Assigned: 'assigned',
  'New Contract': 'new',
  'Submitted to Underwriting': 'in_progress',
  'eSign Initiated': 'in_progress',
  'eSign Completed': 'in_progress',
  'Underwriting Review': 'in_progress',
  'Contract Onboarding': 'pending',
  'Dead Contract': 'closed',
  'Contract Declined': 'closed',
};

export const UNDERWRITING_STATUS = {
  Assigned: 'assigned',
  'New Contract': 'new',
  'Underwriting Review': 'in_progress',
  'In Review': 'in_progress',
  Pend: 'pending',
  'Missing Information': 'pending',
  'Pend Response': 'pending',
  'Merchant Approval': 'pending',
  Approved: 'closed',
  Declined: 'closed',
};

export const ONBOARDING_STATUS = {
  Assigned: 'assigned',
  New: 'new',
  'In Progress': 'in_progress',
  Pending: 'pending',
  'Pending Bank Review': 'pending',
  'Pending Internal Review': 'pending',
  Approved: 'closed',
  Declined: 'closed',
};

export const LIVE_STATUS = {
  OnBoarded: 'new',
  Assigned: 'assigned',
  Active: 'in_progress',
  'On Hold': 'pending',
  Closed: 'closed',
};

/** Every status a given stage can move to — feeds the Change Status modal. */
export const statusOptionsFor = (map) => Object.keys(map);

/** Bucket a row using its stage's map, falling back to "new". */
export const bucketOf = (map, status) => map[status] ?? 'new';

/* ------------------------------------------------------------------ *
 * Stage 1 — Invitations
 * ------------------------------------------------------------------ */

const INVITATIONS_ROWS = [
  {
    id: 'inv-1', merchant: 'Alderton Medical Supply LLC', agent: 'Sheena Ericson', assignedTo: '',
    contact: 'Daniel Ashworth', phone: '(305) 555-9963', email: 'd.ashworth@aldertonmedicalsupply.com',
    created: '2026/08/11', statusChanged: '2026/08/20', status: 'New Lead',
  },
  {
    id: 'inv-2', merchant: 'Brighton Digital Services LLC', agent: 'Terry Boren', assignedTo: '',
    contact: 'Max Muller', phone: '(720) 555-8843', email: 'm.muller@brightondigitalservices.com',
    created: '2026/08/11', statusChanged: '2026/08/20', status: 'New Lead',
  },
  {
    id: 'inv-3', merchant: 'Stanhope Retail Group LLC', agent: 'Kelly Kaiser', assignedTo: '',
    contact: 'Gary Blaze', phone: '(404) 555-7520', email: 'g.blaze@stanhoperetailgroup.com',
    created: '2026/08/11', statusChanged: '2026/08/20', status: 'New Lead',
  },
  {
    id: 'inv-4', merchant: 'Blackwood Enterprises LLC', agent: 'Kelly Kaiser', assignedTo: 'Adam Prescott',
    contact: 'Max Black', phone: '(216) 555-9774', email: 'm.black@blackwoodenterprises.com',
    created: '2026/08/07', statusChanged: '2026/08/18', status: 'Assigned',
  },
  {
    id: 'inv-5', merchant: 'Smithfield Consulting LLC', agent: 'Jennifer Hyatt', assignedTo: 'Robin White',
    contact: 'Marcus Fellowes', phone: '(212) 555-8051', email: 'm.fellowes@smithfieldconsulting.com',
    created: '2026/08/07', statusChanged: '2026/08/18', status: 'Assigned',
  },
  {
    id: 'inv-6', merchant: 'Earlswood Distribution Co', agent: 'Christopher Earl', assignedTo: 'Evan Walker',
    contact: 'Rachel Okafor', phone: '(212) 555-8051', email: 'r.okafor@earlswooddistribution.com',
    created: '2026/07/31', statusChanged: '2026/08/14', status: 'WIP Lead',
  },
  {
    id: 'inv-7', merchant: 'Marlow Food Services LLC', agent: 'Linden Martinez', assignedTo: 'Francis Hughes',
    contact: 'Priya Desai', phone: '(704) 555-3890', email: 'p.desai@marlowfoodservices.com',
    created: '2026/07/31', statusChanged: '2026/08/14', status: 'WIP Lead',
  },
  {
    id: 'inv-8', merchant: 'Leonard & Co Arts LLC', agent: 'Jillian Davies', assignedTo: 'Thomas Clarke',
    contact: 'Penny Leonard', phone: '(415) 555-7831', email: 'p.leonard@leonardcoarts.com',
    created: '2026/07/22', statusChanged: '2026/08/10', status: 'Dead Lead',
  },
]

/** Each row plus its derived merchant attributes. */
export const INVITATIONS = INVITATIONS_ROWS.map((r) => funnelRow(r, { boarded: false }));

/* ------------------------------------------------------------------ *
 * Stage 2 — Applications
 * ------------------------------------------------------------------ */

const APPLICATIONS_ROWS = [
  {
    id: 'app-1', merchant: 'Liberty Bell Tutoring', agent: 'Rachel Pope', assignedTo: 'Linden Martinez',
    contact: 'Dan Hewitt', phone: '020-7946-0841', email: 'd.hewitt@libertybelltutoring.com',
    created: '2026/08/03', statusChanged: '2026/08/14', status: 'Assigned',
  },
  {
    id: 'app-2', merchant: 'Merrimack Valley Wines', agent: 'Gayle Seder', assignedTo: 'Chris Benson',
    contact: 'Nina Osei', phone: '020-7946-0302', email: 'n.osei@merrimackvalleywines.com',
    created: '2026/08/06', statusChanged: '2026/08/14', status: 'Assigned',
  },
  {
    id: 'app-3', merchant: 'Evergreen Digital Agency', agent: 'Gayle Seder', assignedTo: '',
    contact: 'Priya Nair', phone: '020-7946-0119', email: 'p.nair@evergreendigitalagency.com',
    created: '2026/07/31', statusChanged: '2026/08/14', status: 'New Contract',
  },
  {
    id: 'app-4', merchant: 'Bluegrass Direct Sales', agent: 'Marcus Chen', assignedTo: 'Evan Walker',
    contact: 'James Okafor', phone: '020-7946-0554', email: 'j.okafor@bluegrassdirectsales.com',
    created: '2026/07/28', statusChanged: '2026/08/11', status: 'Submitted to Underwriting',
  },
  {
    id: 'app-5', merchant: 'Topsail Surf School', agent: 'Paul Compton', assignedTo: 'Robin White',
    contact: 'Sarah Evans', phone: '020-7946-0896', email: 's.evans@topsailsurfschool.com',
    created: '2026/07/24', statusChanged: '2026/08/10', status: 'eSign Initiated',
  },
  {
    id: 'app-6', merchant: 'Greenfield Print Co', agent: 'Sheena Ericson', assignedTo: 'Bailey Green',
    contact: 'Tom Griffiths', phone: '020-7946-0221', email: 't.griffiths@greenfieldprint.com',
    created: '2026/07/22', statusChanged: '2026/08/07', status: 'eSign Completed',
  },
  {
    id: 'app-7', merchant: 'Lakeside Garden Center', agent: 'Francis Hughes', assignedTo: 'Adam Prescott',
    contact: 'Oliver Shaw', phone: '020-7946-0773', email: 'o.shaw@lakesidegardencenter.com',
    created: '2026/07/20', statusChanged: '2026/08/07', status: 'Underwriting Review',
  },
  {
    id: 'app-8', merchant: 'Monroe Steel Fabricators', agent: 'Broadus Jones', assignedTo: 'Francis Hughes',
    contact: 'Andrew Simon', phone: '020-7946-0482', email: 'a.simon@monroesteelfabricators.com',
    created: '2026/07/10', statusChanged: '2026/08/03', status: 'Contract Onboarding',
  },
  {
    id: 'app-9', merchant: 'Elmwood Engineering', agent: 'Eric Weeks', assignedTo: 'Braden Taylor',
    contact: 'Rachel Webb', phone: '020-7946-0740', email: 'r.webb@elmwoodengineering.com',
    created: '2026/07/03', statusChanged: '2026/07/30', status: 'Dead Contract',
  },
  {
    id: 'app-10', merchant: 'SBL Financial', agent: 'Braden Taylor', assignedTo: 'Alan Demoss',
    contact: 'Marc Schwann', phone: '020-7946-0301', email: 'm.schwann@sblfinancial.com',
    created: '2026/07/10', statusChanged: '2026/07/31', status: 'Contract Declined',
  },
]

/** Each row plus its derived merchant attributes. */
export const APPLICATIONS = APPLICATIONS_ROWS.map((r) => funnelRow(r, { boarded: false }));

/* ------------------------------------------------------------------ *
 * Stage 3 — Underwriting
 * ------------------------------------------------------------------ */

const UNDERWRITING_ROWS = [
  { id: 'uw-1', merchant: 'Midwest Craft Supply Co', agent: 'Terry Boren', assignedTo: 'Braden Taylor', risk: 'medium', contact: 'Brandi Allen', phone: '(305) 555-6362', email: 'b.allen@midwestcraftsupply.com', created: '2026/08/07', statusChanged: '2026/08/17', status: 'Assigned' },
  { id: 'uw-2', merchant: 'Kenwood Outdoor Supply', agent: 'Linda Marsh', assignedTo: 'Braden Taylor', risk: 'low', contact: 'Derek Simmons', phone: '(312) 555-0983', email: 'd.simmons@kenwoodoutdoorsupply.com', created: '2026/08/07', statusChanged: '2026/08/17', status: 'Assigned' },
  { id: 'uw-3', merchant: 'Brooklyn Web Studios', agent: 'Kelly Kaiser', assignedTo: '', risk: 'low', contact: 'Taylor Rialls', phone: '(305) 555-5934', email: 't.rialls@brooklynwebstudios.com', created: '2026/08/07', statusChanged: '2026/08/18', status: 'New Contract' },
  { id: 'uw-4', merchant: 'Liberty Bell Tutoring', agent: 'Christopher Earl', assignedTo: '', risk: 'medium', contact: 'Fiona Clarke', phone: '(720) 555-4046', email: 'f.clarke@libertybelltutoring.com', created: '2026/08/07', statusChanged: '2026/08/19', status: 'New Contract' },
  { id: 'uw-5', merchant: 'Evergreen Digital Agency', agent: 'Ronald Hogan', assignedTo: '', risk: 'high', contact: 'James Whitfield', phone: '(206) 555-8214', email: 'j.whitfield@evergreendigitalagency.com', created: '2026/08/07', statusChanged: '2026/08/19', status: 'New Contract' },
  { id: 'uw-6', merchant: 'Cascade Mountain Sports', agent: 'Linden Martinez', assignedTo: 'Evan Walker', risk: 'medium', contact: 'Evan Walker', phone: '(305) 555-7905', email: 'e.walker@cascademountainsports.com', created: '2026/08/03', statusChanged: '2026/08/14', status: 'Underwriting Review' },
  { id: 'uw-7', merchant: 'Tropical Flavors Bistro', agent: 'Christopher Earl', assignedTo: 'Robin White', risk: 'low', contact: 'Charles Horgan', phone: '(212) 555-5659', email: 'c.horgan@tropicalflavorsbistro.com', created: '2026/08/03', statusChanged: '2026/08/14', status: 'Underwriting Review' },
  { id: 'uw-8', merchant: 'Bluegrass Direct Sales', agent: 'Ronald Hogan', assignedTo: 'Bailey Green', risk: 'low', contact: 'Marc Schwann', phone: '(602) 555-9525', email: 'm.schwann@bluegrassdirectsales.com', created: '2026/08/03', statusChanged: '2026/08/14', status: 'Underwriting Review' },
  { id: 'uw-9', merchant: 'Deep Dish Delights', agent: 'Jennifer Hyatt', assignedTo: 'Adam Prescott', risk: 'medium', contact: 'Arthur Jackson', phone: '(415) 555-7084', email: 'a.jackson@deepdishdelights.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'In Review' },
  { id: 'uw-10', merchant: 'Sunshine Pool & Spa', agent: 'Eric Bolen', assignedTo: 'Alan Demoss', risk: 'high', contact: 'Ivy Monroe', phone: '(512) 555-2906', email: 'i.monroe@sunshinepoolspa.com', created: '2026/08/07', statusChanged: '2026/08/14', status: 'In Review' },
  { id: 'uw-11', merchant: 'Peach State Auto Spa', agent: 'Bernard Clooney', assignedTo: 'Francis Hughes', risk: 'low', contact: 'Simon Griffiths', phone: '(216) 555-8932', email: 's.griffiths@peachstateautospa.com', created: '2026/08/07', statusChanged: '2026/08/14', status: 'In Review' },
  { id: 'uw-12', merchant: 'Bridgeport Food Services', agent: 'Kelly Kaiser', assignedTo: 'Adam Prescott', risk: 'medium', contact: 'Rebecca Turner', phone: '(720) 555-3248', email: 'r.turner@bridgeportfoodservices.com', created: '2026/07/31', statusChanged: '2026/08/11', status: 'Pend' },
  { id: 'uw-13', merchant: 'Riverton Timber Supply', agent: 'Linden Martinez', assignedTo: 'Evan Walker', risk: 'high', contact: 'Nigel Watts', phone: '(216) 555-4921', email: 'n.watts@rivertontimbersupply.com', created: '2026/07/31', statusChanged: '2026/08/10', status: 'Missing Information' },
  { id: 'uw-14', merchant: 'Summit Textiles Inc', agent: 'Terry Boren', assignedTo: 'Robin White', risk: 'low', contact: 'Graham Reid', phone: '(720) 555-7251', email: 'g.reid@summittextiles.com', created: '2026/08/05', statusChanged: '2026/08/13', status: 'Pend Response' },
  { id: 'uw-15', merchant: 'Clearwater Catering Supply', agent: 'Jennifer Hyatt', assignedTo: 'Bailey Green', risk: 'low', contact: 'Patricia Holmes', phone: '(720) 555-9220', email: 'p.holmes@clearwatercateringsupply.com', created: '2026/07/27', statusChanged: '2026/08/07', status: 'Merchant Approval' },
  { id: 'uw-16', merchant: 'Merrimack Valley Wines', agent: 'Gayle Seder', assignedTo: 'Chris Benson', risk: 'medium', contact: 'Nina Osei', phone: '(617) 555-9671', email: 'n.osei@merrimackvalleywines.com', created: '2026/07/24', statusChanged: '2026/08/05', status: 'Approved' },
  { id: 'uw-17', merchant: 'Lakeside Garden Center', agent: 'Francis Hughes', assignedTo: 'Adam Prescott', risk: 'low', contact: 'Oliver Shaw', phone: '(212) 555-7291', email: 'o.shaw@lakesidegardencenter.com', created: '2026/07/20', statusChanged: '2026/08/03', status: 'Approved' },
  { id: 'uw-18', merchant: 'CloudCart Solutions', agent: 'Eric Weeks', assignedTo: 'Braden Taylor', risk: 'high', contact: 'Rachel Webb', phone: '(512) 555-5791', email: 'r.webb@cloudcartsolutions.com', created: '2026/07/10', statusChanged: '2026/07/30', status: 'Declined' },
]

/** Each row plus its derived merchant attributes. */
export const UNDERWRITING = UNDERWRITING_ROWS.map((r) => funnelRow(r, { boarded: true }));

/* ------------------------------------------------------------------ *
 * Stage 4 — Onboarding
 * ------------------------------------------------------------------ */

const ONBOARDING_ROWS = [
  { id: 'onb-1', merchant: 'Cascade Mountain Sports', agent: 'Linden Martinez', assignedTo: '', contact: 'Julian Evans', phone: '(305) 555-7905', email: 'j.evans@cascademountainsports.com', created: '2026/08/05', statusChanged: '2026/08/10', status: 'Pending' },
  { id: 'onb-2', merchant: 'Tropical Flavors Bistro', agent: 'Christopher Earl', assignedTo: '', contact: 'Charles Horgan', phone: '(212) 555-5659', email: 'c.horgan@tropicalflavorsbistro.com', created: '2026/08/06', statusChanged: '2026/08/11', status: 'Pending' },
  { id: 'onb-3', merchant: 'Stone Mountain BBQ', agent: 'Jillian Davies', assignedTo: 'Thomas Clarke', contact: 'George Weston', phone: '(212) 555-4472', email: 'g.weston@stonemountainbbq.com', created: '2026/08/10', statusChanged: '2026/08/14', status: 'Assigned' },
  { id: 'onb-4', merchant: 'Brooklyn Web Studios', agent: 'Kelly Kaiser', assignedTo: 'Taylor Rialls', contact: 'James Gordon', phone: '(305) 555-5934', email: 'j.gordon@brooklynwebstudios.com', created: '2026/08/10', statusChanged: '2026/08/14', status: 'Assigned' },
  { id: 'onb-5', merchant: 'Bluegrass Direct Sales', agent: 'Ronald Hogan', assignedTo: 'Bailey Green', contact: 'Marc Schwann', phone: '(602) 555-9525', email: 'm.schwann@bluegrassdirectsales.com', created: '2026/08/07', statusChanged: '2026/08/13', status: 'In Progress' },
  { id: 'onb-6', merchant: 'Midwest Craft Supply Co', agent: 'Terry Boren', assignedTo: 'Braden Taylor', contact: 'Brandi Allen', phone: '(305) 555-6362', email: 'b.allen@midwestcraftsupply.com', created: '2026/08/07', statusChanged: '2026/08/13', status: 'In Progress' },
  { id: 'onb-7', merchant: 'Sunshine Pool & Spa', agent: 'Eric Bolen', assignedTo: 'Alan Demoss', contact: 'Ivy Monroe', phone: '(512) 555-2906', email: 'i.monroe@sunshinepoolspa.com', created: '2026/07/31', statusChanged: '2026/08/07', status: 'Pending Bank Review' },
  { id: 'onb-8', merchant: 'Peach State Auto Spa', agent: 'Bernard Clooney', assignedTo: 'Francis Hughes', contact: 'Simon Griffiths', phone: '(216) 555-8932', email: 's.griffiths@peachstateautospa.com', created: '2026/07/31', statusChanged: '2026/08/07', status: 'Pending Internal Review' },
  { id: 'onb-9', merchant: 'Deep Dish Delights', agent: 'Jennifer Hyatt', assignedTo: 'Adam Prescott', contact: 'Arthur Jackson', phone: '(415) 555-7084', email: 'a.jackson@deepdishdelights.com', created: '2026/07/31', statusChanged: '2026/08/07', status: 'Approved' },
  { id: 'onb-10', merchant: 'Lakeside Event Rentals', agent: 'Sheena Ericson', assignedTo: 'Wilson Adams', contact: 'Charmaine Blanc', phone: '(617) 555-1281', email: 'c.blanc@lakesideeventrentals.com', created: '2026/07/28', statusChanged: '2026/07/31', status: 'Declined' },
]

/** Each row plus its derived merchant attributes. */
export const ONBOARDING = ONBOARDING_ROWS.map((r) => funnelRow(r, { boarded: true }));

/* ------------------------------------------------------------------ *
 * Stage 5 — Live Participants
 * ------------------------------------------------------------------ */

const LIVE_PARTICIPANTS_ROWS = [
  { id: 'live-1', merchant: 'Peach State Auto Spa', highest: 247500, trend: 'up', agent: 'Bernard Clooney', assignedTo: '', contact: 'Simon Griffiths', phone: '(216) 555-8932', email: 's.griffiths@peachstateautospa.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'OnBoarded' },
  { id: 'live-2', merchant: 'Bluegrass Direct Sales', highest: 89300, trend: 'down', agent: 'Ronald Hogan', assignedTo: '', contact: 'Marc Schwann', phone: '(602) 555-9525', email: 'm.schwann@bluegrassdirectsales.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'OnBoarded' },
  { id: 'live-3', merchant: 'Lakeside Event Rentals', highest: 1250000, trend: 'up', agent: 'Sheena Ericson', assignedTo: '', contact: 'Charmaine Blanc', phone: '(617) 555-1281', email: 'c.blanc@lakesideeventrentals.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'OnBoarded' },
  { id: 'live-4', merchant: 'Tropical Flavors Bistro', highest: 875000, trend: 'up', agent: 'Christopher Earl', assignedTo: 'Robin White', contact: 'Charles Horgan', phone: '(212) 555-5659', email: 'c.horgan@tropicalflavorsbistro.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'Assigned' },
  { id: 'live-5', merchant: 'Sunshine Pool & Spa', highest: 342800, trend: 'down', agent: 'Eric Bolen', assignedTo: 'Alan Demoss', contact: 'Ivy Monroe', phone: '(512) 555-2906', email: 'i.monroe@sunshinepoolspa.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'Assigned' },
  { id: 'live-6', merchant: 'Cascade Mountain Sports', highest: 567200, trend: 'up', agent: 'Linden Martinez', assignedTo: 'Evan Walker', contact: 'Julian Evans', phone: '(305) 555-7905', email: 'j.evans@cascademountainsports.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'Assigned' },
  { id: 'live-7', merchant: 'Deep Dish Delights', highest: 156700, trend: 'up', agent: 'Jennifer Hyatt', assignedTo: 'Adam Prescott', contact: 'Arthur Jackson', phone: '(415) 555-7084', email: 'a.jackson@deepdishdelights.com', created: '2026/07/21', statusChanged: '2026/08/07', status: 'Active' },
  { id: 'live-8', merchant: 'Brooklyn Web Studios', highest: 983400, trend: 'up', agent: 'Kelly Kaiser', assignedTo: 'Taylor Rialls', contact: 'James Gordon', phone: '(305) 555-5934', email: 'j.gordon@brooklynwebstudios.com', created: '2026/07/21', statusChanged: '2026/08/07', status: 'Active' },
  { id: 'live-9', merchant: 'Midwest Craft Supply Co', highest: 421500, trend: 'down', agent: 'Terry Boren', assignedTo: 'Braden Taylor', contact: 'Brandi Allen', phone: '(305) 555-6362', email: 'b.allen@midwestcraftsupply.com', created: '2026/07/21', statusChanged: '2026/08/07', status: 'Active' },
  { id: 'live-10', merchant: 'Bluegrass Direct Sales', highest: 72100, trend: 'down', agent: 'Ronald Hogan', assignedTo: 'Bailey Green', contact: 'Marc Schwann', phone: '(602) 555-9525', email: 'm.schwann@bluegrassdirectsales.com', created: '2026/08/05', statusChanged: '2026/08/07', status: 'On Hold' },
  { id: 'live-11', merchant: 'Stone Mountain BBQ', highest: 198800, trend: 'up', agent: 'Jillian Davies', assignedTo: 'Thomas Clarke', contact: 'George Weston', phone: '(212) 555-4472', email: 'g.weston@stonemountainbbq.com', created: '2026/07/23', statusChanged: '2026/08/07', status: 'Closed' },
]

/** Each row plus its derived merchant attributes. */
export const LIVE_PARTICIPANTS = LIVE_PARTICIPANTS_ROWS.map((r) => funnelRow(r, { boarded: true }));

/* ------------------------------------------------------------------ *
 * Tabs
 * ------------------------------------------------------------------ */

const TAB_ORDER = ['all', 'assigned', 'new', 'in_progress', 'pending', 'closed'];
const TAB_LABELS = { all: 'All', assigned: 'Assigned', new: 'New', in_progress: 'In Progress', pending: 'Pending', closed: 'Closed' };

/** Tab descriptors with counts derived from the rows and the stage's map. */
export function stageTabs(rows, statusMap) {
  const counts = rows.reduce((acc, r) => {
    const b = bucketOf(statusMap, r.status);
    acc[b] = (acc[b] ?? 0) + 1;
    return acc;
  }, {});

  return TAB_ORDER.map((value) => ({
    value,
    label: TAB_LABELS[value],
    count: value === 'all' ? rows.length : (counts[value] ?? 0),
  }));
}

export function filterStage(rows, tab, statusMap) {
  if (tab === 'all') return rows;
  return rows.filter((r) => bucketOf(statusMap, r.status) === tab);
}

/* ------------------------------------------------------------------ *
 * Per-record detail
 * ------------------------------------------------------------------ */

/** Seeded attachments — the Attachments modal on Invitations. */
export const ATTACHMENTS_BY_RECORD = {
  'inv-1': [
    { id: 'a1', name: 'merchant_application.pdf', description: 'Initial merchant application form completed by agent', type: 'Internal', date: '2026/08/04', size: '2.3 MB' },
    { id: 'a2', name: 'kyc_verification.xlsx', description: 'Know Your Customer verification checklist with all supporting documents', type: 'Checklist KYC', date: '2026/08/06', size: '500.0 KB' },
    { id: 'a3', name: 'bank_statement_q1.pdf', description: 'Recent quarterly bank statement for financial verification', type: 'Checklist MPA', date: '2026/08/08', size: '1.8 MB' },
    { id: 'a4', name: 'tax_id_certificate.jpg', description: 'Federal Tax ID certificate verification document', type: 'TinCheck', date: '2026/08/09', size: '1.0 MB' },
  ],
};

/** Seeded notes — the View Notes modal on Applications. */
export const NOTES_BY_RECORD = {
  'app-2': [
    { id: 'n1', user: 'Wilson Adams', type: 'Public Notes', date: '2026/08/04', description: 'Initial contact with merchant regarding application requirements. Merchant confirmed business address and provided updated banking details.', attachments: ['application_docs.pdf', 'bank_verification.jpg'] },
    { id: 'n2', user: 'Sheena Ericson', type: 'Underwriting & Risk Notes', date: '2026/08/06', description: 'Risk assessment completed. Low risk profile confirmed based on processing history and business type classification.', attachments: [] },
    { id: 'n3', user: 'Marcus Chen', type: 'Secure Notes', date: '2026/08/06', description: 'Verified federal tax ID against IRS records. All documentation is in order for underwriting approval.', attachments: ['tax_id_verification.pdf'] },
  ],
};

export const attachmentsFor = (id) => ATTACHMENTS_BY_RECORD[id] ?? [];
export const notesFor = (id) => NOTES_BY_RECORD[id] ?? [];

/** Find a record across every stage — detail routes resolve through this. */
export const findParticipantRecord = (id) =>
  [...INVITATIONS, ...APPLICATIONS, ...UNDERWRITING, ...ONBOARDING, ...LIVE_PARTICIPANTS].find((r) => r.id === id) ?? null;

/** Statement history shown by the Live Participants "Statements" action. */
export const statementsFor = (row) => [
  { merchant: row.merchant, month: '2026/03/01' },
  { merchant: row.merchant, month: 'April-2025' },
];

/** Merchants beneath a live participant — the Participant Merchants sub-page. */
export const participantMerchants = (row) => {
  const base = [
    { name: 'Tenty LLC', type: 'Merchant', agent: 'Rachel Pope', contact: 'Herold Harrison', mid: 'C336011615', email: 'emil.tenty@hotmail.com', changed: '2026/08/12', created: '2026/08/01', status: 'Onboarded' },
    { name: 'Morgan and Sons', type: 'Merchant', agent: 'Sheena Ericson', contact: 'Merrick Fellowes', mid: '3776319866B', email: 'cell.morgan@gmail.com', changed: '2026/08/12', created: '2026/08/01', status: 'Closed' },
    { name: 'Bailey - Weiss', type: 'Merchant', agent: 'Sammy Larkin', contact: 'Otis Baker', mid: '0899561840', email: 'affiliate.bailey@aol.com', changed: '2026/08/12', created: '2026/08/02', status: 'Onboarded' },
    { name: 'Kuhlman Group', type: 'Merchant', agent: 'Elias Jones', contact: 'Marie Kuhl', mid: '1859990010', email: 'lead.kuhlman@mail.com', changed: '2026/08/12', created: '2026/08/03', status: 'Active' },
  ];
  return base.map((m, i) => ({ ...m, id: `${row.id}-m${i}`, merchant: row.merchant }));
};

/** Contacts pool re-exported so the detail forms can offer an owner picker. */
export { CONTACTS };
