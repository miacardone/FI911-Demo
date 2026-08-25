/**
 * PARTICIPANTS — the onboarding funnel.
 *
 * Five stages, each its own list screen: Invitations → Applications →
 * Underwriting → Onboarding → Live Participants.
 *
 * These rows are written out rather than generated. Everything else in this
 * console is seeded from rng.js, but the funnel is the demo's narrative spine:
 * the same institutions have to reappear at the right stage with the right
 * agent and contact, and Lloyds Bank must be mid-underwriting on one screen
 * and live on another. A generator would produce plausible rows that told no
 * story.
 *
 * TAB COUNTS ARE DERIVED, NOT DECLARED. Each stage owns an explicit
 * status → bucket map (`*_STATUS`) and the tab counts come from running the
 * rows through it. That is why a count can never disagree with the rows behind
 * it — the failure mode where "Pending (3)" opens onto four rows is
 * unreachable by construction. Keyword-guessing the bucket from the status
 * text was the alternative and it breaks on real pairs like "eSign Completed"
 * (in progress) versus "Contract Completed" (closed).
 */

import { CONTACTS } from '@/apm/data/people';

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

export const INVITATIONS = [
  {
    id: 'inv-1', participant: 'Alderton Medical Supplies Ltd', agent: 'Sheena Ericson', assignedTo: '',
    contact: 'Daniel Ashworth', phone: '07834 512967', email: 'd.ashworth@aldertonmedical.co.uk',
    created: '2026/08/11', statusChanged: '2026/08/20', status: 'New Lead',
  },
  {
    id: 'inv-2', participant: 'Broughton Digital Services Ltd', agent: 'Terry Boren', assignedTo: '',
    contact: 'Max Muller', phone: '07712 334891', email: 'm.muller@broughtondigital.co.uk',
    created: '2026/08/11', statusChanged: '2026/08/20', status: 'New Lead',
  },
  {
    id: 'inv-3', participant: 'Stanhope Retail Group Ltd', agent: 'Kelly Kaiser', assignedTo: '',
    contact: 'Gary Blaze', phone: '07590 183742', email: 'g.blaze@stanhoperetail.co.uk',
    created: '2026/08/11', statusChanged: '2026/08/20', status: 'New Lead',
  },
  {
    id: 'inv-4', participant: 'Blackwood Enterprises Ltd', agent: 'Kelly Kaiser', assignedTo: 'Adam Prescott',
    contact: 'Max Black', phone: '07456 229034', email: 'm.black@blackwoodenterprises.co.uk',
    created: '2026/08/07', statusChanged: '2026/08/18', status: 'Assigned',
  },
  {
    id: 'inv-5', participant: 'Smithfield Consulting Ltd', agent: 'Jennifer Hyatt', assignedTo: 'Robin White',
    contact: 'Marcus Fellowes', phone: '07700 942381', email: 'm.fellowes@smithfieldconsulting.co.uk',
    created: '2026/08/07', statusChanged: '2026/08/18', status: 'Assigned',
  },
  {
    id: 'inv-6', participant: 'Earlswood Distribution Co Ltd', agent: 'Christopher Earl', assignedTo: 'Evan Walker',
    contact: 'Rachel Okafor', phone: '07700 942381', email: 'r.okafor@earlswooddist.co.uk',
    created: '2026/07/31', statusChanged: '2026/08/14', status: 'WIP Lead',
  },
  {
    id: 'inv-7', participant: 'Marlow Food Services Ltd', agent: 'Linden Martinez', assignedTo: 'Francis Hughes',
    contact: 'Priya Desai', phone: '07911 638204', email: 'p.desai@marlowfoodservices.co.uk',
    created: '2026/07/31', statusChanged: '2026/08/14', status: 'WIP Lead',
  },
  {
    id: 'inv-8', participant: 'Leonard & Co Arts Ltd', agent: 'Jillian Davies', assignedTo: 'Thomas Clarke',
    contact: 'Penny Leonard', phone: '07802 471563', email: 'p.leonard@leonardcoarts.co.uk',
    created: '2026/07/22', statusChanged: '2026/08/10', status: 'Dead Lead',
  },
];

/* ------------------------------------------------------------------ *
 * Stage 2 — Applications
 * ------------------------------------------------------------------ */

export const APPLICATIONS = [
  {
    id: 'app-1', participant: 'Monzo Business', type: 'PSP', agent: 'Rachel Pope', assignedTo: 'Linden Martinez',
    contact: 'Dan Hewitt', phone: '020-7946-0841', email: 'dan.hewitt@monzo.com',
    created: '2026/08/03', statusChanged: '2026/08/14', status: 'Assigned',
  },
  {
    id: 'app-2', participant: 'Tide Payments', type: 'PSP', agent: 'Gayle Seder', assignedTo: 'Chris Benson',
    contact: 'Nina Osei', phone: '020-7946-0302', email: 'n.osei@tidepayments.com',
    created: '2026/08/06', statusChanged: '2026/08/14', status: 'Assigned',
  },
  {
    id: 'app-3', participant: 'Revolut Business', type: 'PSP', agent: 'Gayle Seder', assignedTo: '',
    contact: 'Priya Nair', phone: '020-7946-0119', email: 'priya.nair@revolut.com',
    created: '2026/07/31', statusChanged: '2026/08/14', status: 'New Contract',
  },
  {
    id: 'app-4', participant: 'Starling Bank', type: 'Bank', agent: 'Marcus Chen', assignedTo: 'Evan Walker',
    contact: 'James Okafor', phone: '020-7946-0554', email: 'j.okafor@starling.com',
    created: '2026/07/28', statusChanged: '2026/08/11', status: 'Submitted to Underwriting',
  },
  {
    id: 'app-5', participant: 'NatWest Payments', type: 'Bank', agent: 'Paul Compton', assignedTo: 'Robin White',
    contact: 'Sarah Evans', phone: '020-7946-0896', email: 's.evans@natwest.com',
    created: '2026/07/24', statusChanged: '2026/08/10', status: 'eSign Initiated',
  },
  {
    id: 'app-6', participant: 'Lloyds Commercial', type: 'PSP', agent: 'Sheena Ericson', assignedTo: 'Bailey Green',
    contact: 'Tom Griffiths', phone: '020-7946-0221', email: 't.griffiths@lloyds.com',
    created: '2026/07/22', statusChanged: '2026/08/07', status: 'eSign Completed',
  },
  {
    id: 'app-7', participant: 'ClearBank', type: 'Bank', agent: 'Francis Hughes', assignedTo: 'Adam Prescott',
    contact: 'Oliver Shaw', phone: '020-7946-0773', email: 'o.shaw@clearbank.com',
    created: '2026/07/20', statusChanged: '2026/08/07', status: 'Underwriting Review',
  },
  {
    id: 'app-8', participant: 'HSBC Merchant Services', type: 'Bank', agent: 'Broadus Jones', assignedTo: 'Francis Hughes',
    contact: 'Andrew Simon', phone: '020-7946-0482', email: 'a.simon@hsbc.com',
    created: '2026/07/10', statusChanged: '2026/08/03', status: 'Contract Onboarding',
  },
  {
    id: 'app-9', participant: 'Barclays Payments', type: 'Bank', agent: 'Eric Weeks', assignedTo: 'Braden Taylor',
    contact: 'Rachel Webb', phone: '020-7946-0740', email: 'r.webb@barclays.com',
    created: '2026/07/03', statusChanged: '2026/07/30', status: 'Dead Contract',
  },
  {
    id: 'app-10', participant: 'SBL Financial', type: 'PSP', agent: 'Braden Taylor', assignedTo: 'Alan Demoss',
    contact: 'Marc Schwann', phone: '020-7946-0301', email: 'm.schwann@sbl.com',
    created: '2026/07/10', statusChanged: '2026/07/31', status: 'Contract Declined',
  },
];

/* ------------------------------------------------------------------ *
 * Stage 3 — Underwriting
 * ------------------------------------------------------------------ */

export const UNDERWRITING = [
  { id: 'uw-1', participant: 'Bank of Scotland', type: 'PSP', agent: 'Terry Boren', assignedTo: 'Braden Taylor', risk: 'medium', contact: 'Brandi Allen', phone: '0201234567', email: 'braden.taylor@rbs.com', created: '2026/08/07', statusChanged: '2026/08/17', status: 'Assigned' },
  { id: 'uw-2', participant: 'Metro Bank', type: 'PSP', agent: 'Linda Marsh', assignedTo: 'Braden Taylor', risk: 'low', contact: 'Derek Simmons', phone: '0207654321', email: 'd.simmons@metrobank.co.uk', created: '2026/08/07', statusChanged: '2026/08/17', status: 'Assigned' },
  { id: 'uw-3', participant: 'Barclays', type: 'Bank', agent: 'Kelly Kaiser', assignedTo: '', risk: 'low', contact: 'Taylor Rialls', phone: '0207887223', email: 'gordon.j@barclays.com', created: '2026/08/07', statusChanged: '2026/08/18', status: 'New Contract' },
  { id: 'uw-4', participant: 'Monzo Business', type: 'PSP', agent: 'Christopher Earl', assignedTo: '', risk: 'medium', contact: 'Fiona Clarke', phone: '0208551234', email: 'f.clarke@monzo.com', created: '2026/08/07', statusChanged: '2026/08/19', status: 'New Contract' },
  { id: 'uw-5', participant: 'Revolut Business', type: 'PSP', agent: 'Ronald Hogan', assignedTo: '', risk: 'high', contact: 'James Whitfield', phone: '0209981100', email: 'j.whitfield@revolut.com', created: '2026/08/07', statusChanged: '2026/08/19', status: 'New Contract' },
  { id: 'uw-6', participant: 'Lloyds Bank', type: 'PSP', agent: 'Linden Martinez', assignedTo: 'Evan Walker', risk: 'medium', contact: 'Evan Walker', phone: '0201569978', email: 'j.evans@lloydsbank.com', created: '2026/08/03', statusChanged: '2026/08/14', status: 'Underwriting Review' },
  { id: 'uw-7', participant: 'HSBC', type: 'Bank', agent: 'Christopher Earl', assignedTo: 'Robin White', risk: 'low', contact: 'Charles Horgan', phone: '0204271002', email: 'c.horgan@hsbc.uk.com', created: '2026/08/03', statusChanged: '2026/08/14', status: 'Underwriting Review' },
  { id: 'uw-8', participant: 'Starling Bank Limited', type: 'PSP', agent: 'Ronald Hogan', assignedTo: 'Bailey Green', risk: 'low', contact: 'Marc Schwann', phone: '0208469246', email: 'marc.schwann@sbl.com', created: '2026/08/03', statusChanged: '2026/08/14', status: 'Underwriting Review' },
  { id: 'uw-9', participant: 'Halifax', type: 'PSP', agent: 'Jennifer Hyatt', assignedTo: 'Adam Prescott', risk: 'medium', contact: 'Arthur Jackson', phone: '0202334244', email: 'a.jackson@halifax.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'In Review' },
  { id: 'uw-10', participant: 'Santander UK', type: 'PSP', agent: 'Eric Bolen', assignedTo: 'Alan Demoss', risk: 'high', contact: 'Ivy Monroe', phone: '0203018007', email: 'i.monroe@santander.uk.com', created: '2026/08/07', statusChanged: '2026/08/14', status: 'In Review' },
  { id: 'uw-11', participant: 'National Westminster Bank', type: 'Bank', agent: 'Bernard Clooney', assignedTo: 'Francis Hughes', risk: 'low', contact: 'Simon Griffiths', phone: '0203907710', email: 's.griffiths@natwest.com', created: '2026/08/07', statusChanged: '2026/08/14', status: 'In Review' },
  { id: 'uw-12', participant: 'TSB Bank', type: 'PSP', agent: 'Kelly Kaiser', assignedTo: 'Adam Prescott', risk: 'medium', contact: 'Rebecca Turner', phone: '0204455678', email: 'r.turner@tsb.co.uk', created: '2026/07/31', statusChanged: '2026/08/11', status: 'Pend' },
  { id: 'uw-13', participant: 'Virgin Money', type: 'PSP', agent: 'Linden Martinez', assignedTo: 'Evan Walker', risk: 'high', contact: 'Nigel Watts', phone: '0205567890', email: 'n.watts@virginmoney.com', created: '2026/07/31', statusChanged: '2026/08/10', status: 'Missing Information' },
  { id: 'uw-14', participant: 'Clydesdale Bank', type: 'PSP', agent: 'Terry Boren', assignedTo: 'Robin White', risk: 'low', contact: 'Graham Reid', phone: '0206678901', email: 'g.reid@cbonline.co.uk', created: '2026/08/05', statusChanged: '2026/08/13', status: 'Pend Response' },
  { id: 'uw-15', participant: 'Nationwide Building Society', type: 'PSP', agent: 'Jennifer Hyatt', assignedTo: 'Bailey Green', risk: 'low', contact: 'Patricia Holmes', phone: '0207789012', email: 'p.holmes@nationwide.com', created: '2026/07/27', statusChanged: '2026/08/07', status: 'Merchant Approval' },
  { id: 'uw-16', participant: 'Tide Payments', type: 'PSP', agent: 'Gayle Seder', assignedTo: 'Chris Benson', risk: 'medium', contact: 'Nina Osei', phone: '0207946030', email: 'n.osei@tidepayments.com', created: '2026/07/24', statusChanged: '2026/08/05', status: 'Approved' },
  { id: 'uw-17', participant: 'ClearBank', type: 'Bank', agent: 'Francis Hughes', assignedTo: 'Adam Prescott', risk: 'low', contact: 'Oliver Shaw', phone: '0207946077', email: 'o.shaw@clearbank.com', created: '2026/07/20', statusChanged: '2026/08/03', status: 'Approved' },
  { id: 'uw-18', participant: 'Barclays Bank UK', type: 'Bank', agent: 'Eric Weeks', assignedTo: 'Braden Taylor', risk: 'high', contact: 'Rachel Webb', phone: '0207946074', email: 'r.webb@barclays.com', created: '2026/07/10', statusChanged: '2026/07/30', status: 'Declined' },
];

/* ------------------------------------------------------------------ *
 * Stage 4 — Onboarding
 * ------------------------------------------------------------------ */

export const ONBOARDING = [
  { id: 'onb-1', participant: 'Lloyds Bank', type: 'PSP', agent: 'Linden Martinez', assignedTo: '', contact: 'Julian Evans', phone: '0201569978', email: 'j.evans@lloydsbank.com', created: '2026/08/05', statusChanged: '2026/08/10', status: 'Pending' },
  { id: 'onb-2', participant: 'HSBC', type: 'Bank', agent: 'Christopher Earl', assignedTo: '', contact: 'Charles Horgan', phone: '0204271002', email: 'c.horgan@hsbc.uk.com', created: '2026/08/06', statusChanged: '2026/08/11', status: 'Pending' },
  { id: 'onb-3', participant: 'First Direct', type: 'PSP', agent: 'Jillian Davies', assignedTo: 'Thomas Clarke', contact: 'George Weston', phone: '0203348122', email: 'g.weston@firstdirect.com', created: '2026/08/10', statusChanged: '2026/08/14', status: 'Assigned' },
  { id: 'onb-4', participant: 'Barclays', type: 'Bank', agent: 'Kelly Kaiser', assignedTo: 'Taylor Rialls', contact: 'James Gordon', phone: '0207887223', email: 'gordon.j@barclays.com', created: '2026/08/10', statusChanged: '2026/08/14', status: 'Assigned' },
  { id: 'onb-5', participant: 'Starling Bank Limited', type: 'PSP', agent: 'Ronald Hogan', assignedTo: 'Bailey Green', contact: 'Marc Schwann', phone: '0208469246', email: 'marc.schwann@sbl.com', created: '2026/08/07', statusChanged: '2026/08/13', status: 'In Progress' },
  { id: 'onb-6', participant: 'Bank of Scotland', type: 'PSP', agent: 'Terry Boren', assignedTo: 'Braden Taylor', contact: 'Brandi Allen', phone: '0201234567', email: 'braden.taylor@rbs.com', created: '2026/08/07', statusChanged: '2026/08/13', status: 'In Progress' },
  { id: 'onb-7', participant: 'Santander UK', type: 'PSP', agent: 'Eric Bolen', assignedTo: 'Alan Demoss', contact: 'Ivy Monroe', phone: '0203018007', email: 'i.monroe@santander.uk.com', created: '2026/07/31', statusChanged: '2026/08/07', status: 'Pending Bank Review' },
  { id: 'onb-8', participant: 'National Westminster Bank', type: 'Bank', agent: 'Bernard Clooney', assignedTo: 'Francis Hughes', contact: 'Simon Griffiths', phone: '0203907710', email: 's.griffiths@natwest.com', created: '2026/07/31', statusChanged: '2026/08/07', status: 'Pending Internal Review' },
  { id: 'onb-9', participant: 'Halifax', type: 'PSP', agent: 'Jennifer Hyatt', assignedTo: 'Adam Prescott', contact: 'Arthur Jackson', phone: '0202334244', email: 'a.jackson@halifax.com', created: '2026/07/31', statusChanged: '2026/08/07', status: 'Approved' },
  { id: 'onb-10', participant: 'Bank of New York Mellon', type: 'PSP', agent: 'Sheena Ericson', assignedTo: 'Wilson Adams', contact: 'Charmaine Blanc', phone: '0202293328', email: 'c.blanc@bonym.com', created: '2026/07/28', statusChanged: '2026/07/31', status: 'Declined' },
];

/* ------------------------------------------------------------------ *
 * Stage 5 — Live Participants
 * ------------------------------------------------------------------ */

export const LIVE_PARTICIPANTS = [
  { id: 'live-1', participant: 'National Westminster Bank', type: 'Bank', highest: 247500, trend: 'up', agent: 'Bernard Clooney', assignedTo: '', contact: 'Simon Griffiths', phone: '0203907710', email: 's.griffiths@natwest.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'OnBoarded' },
  { id: 'live-2', participant: 'Starling Bank Limited', type: 'PSP', highest: 89300, trend: 'down', agent: 'Ronald Hogan', assignedTo: '', contact: 'Marc Schwann', phone: '0208469246', email: 'marc.schwann@sbl.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'OnBoarded' },
  { id: 'live-3', participant: 'Bank of New York Mellon', type: 'PSP', highest: 1250000, trend: 'up', agent: 'Sheena Ericson', assignedTo: '', contact: 'Charmaine Blanc', phone: '0202293328', email: 'c.blanc@bonym.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'OnBoarded' },
  { id: 'live-4', participant: 'HSBC', type: 'Bank', highest: 875000, trend: 'up', agent: 'Christopher Earl', assignedTo: 'Robin White', contact: 'Charles Horgan', phone: '0204271002', email: 'c.horgan@hsbc.uk.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'Assigned' },
  { id: 'live-5', participant: 'Santander UK', type: 'PSP', highest: 342800, trend: 'down', agent: 'Eric Bolen', assignedTo: 'Alan Demoss', contact: 'Ivy Monroe', phone: '0203018007', email: 'i.monroe@santander.uk.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'Assigned' },
  { id: 'live-6', participant: 'Lloyds Bank', type: 'PSP', highest: 567200, trend: 'up', agent: 'Linden Martinez', assignedTo: 'Evan Walker', contact: 'Julian Evans', phone: '0201569978', email: 'j.evans@lloydsbank.com', created: '2026/07/31', statusChanged: '2026/08/14', status: 'Assigned' },
  { id: 'live-7', participant: 'Halifax', type: 'PSP', highest: 156700, trend: 'up', agent: 'Jennifer Hyatt', assignedTo: 'Adam Prescott', contact: 'Arthur Jackson', phone: '0202334244', email: 'a.jackson@halifax.com', created: '2026/07/21', statusChanged: '2026/08/07', status: 'Active' },
  { id: 'live-8', participant: 'Barclays', type: 'Bank', highest: 983400, trend: 'up', agent: 'Kelly Kaiser', assignedTo: 'Taylor Rialls', contact: 'James Gordon', phone: '0207887223', email: 'gordon.j@barclays.com', created: '2026/07/21', statusChanged: '2026/08/07', status: 'Active' },
  { id: 'live-9', participant: 'Bank of Scotland', type: 'PSP', highest: 421500, trend: 'down', agent: 'Terry Boren', assignedTo: 'Braden Taylor', contact: 'Brandi Allen', phone: '0201234567', email: 'braden.taylor@rbs.com', created: '2026/07/21', statusChanged: '2026/08/07', status: 'Active' },
  { id: 'live-10', participant: 'Starling Bank Limited', type: 'PSP', highest: 72100, trend: 'down', agent: 'Ronald Hogan', assignedTo: 'Bailey Green', contact: 'Marc Schwann', phone: '0208469246', email: 'marc.schwann@sbl.com', created: '2026/08/05', statusChanged: '2026/08/07', status: 'On Hold' },
  { id: 'live-11', participant: 'First Direct', type: 'PSP', highest: 198800, trend: 'up', agent: 'Jillian Davies', assignedTo: 'Thomas Clarke', contact: 'George Weston', phone: '0203348122', email: 'g.weston@firstdirect.com', created: '2026/07/23', statusChanged: '2026/08/07', status: 'Closed' },
];

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
  { participant: row.participant, month: '2026/03/01' },
  { participant: row.participant, month: 'April-2025' },
];

/** Merchants beneath a live participant — the Participant Merchants sub-page. */
export const participantMerchants = (row) => {
  const base = [
    { name: 'Tenty LLC', type: 'Merchant', agent: 'Rachel Pope', contact: 'Herold Harrison', mid: 'C336011615', email: 'emil.tenty@hotmail.com', changed: '2026/08/12', created: '2026/08/01', status: 'Onboarded' },
    { name: 'Morgan and Sons', type: 'Merchant', agent: 'Sheena Ericson', contact: 'Merrick Fellowes', mid: '3776319866B', email: 'cell.morgan@gmail.com', changed: '2026/08/12', created: '2026/08/01', status: 'Closed' },
    { name: 'Bailey - Weiss', type: 'Merchant', agent: 'Sammy Larkin', contact: 'Otis Baker', mid: '0899561840', email: 'affiliate.bailey@aol.com', changed: '2026/08/12', created: '2026/08/02', status: 'Onboarded' },
    { name: 'Kuhlman Group', type: 'Merchant', agent: 'Elias Jones', contact: 'Marie Kuhl', mid: '1859990010', email: 'lead.kuhlman@mail.com', changed: '2026/08/12', created: '2026/08/03', status: 'Active' },
  ];
  return base.map((m, i) => ({ ...m, id: `${row.id}-m${i}`, participant: row.participant }));
};

/** Contacts pool re-exported so the detail forms can offer an owner picker. */
export { CONTACTS };
