/**
 * PEOPLE — the names that appear across the console.
 *
 * These are split by ROLE rather than pooled into one list, because the
 * columns they feed are different questions. An "Agent" is the partner rep
 * who introduced the participant; "Assigned To" is the internal operator
 * working the record; a "Contact" is the participant's own person. Pooling
 * them would put an internal operator in the participant's contact column,
 * which reads as a data bug in a demo.
 */

export const CURRENT_USER = {
  id: 'mia.cardone',
  name: 'Mia Cardone',
  initials: 'MC',
  email: 'mia.cardone@fi911.com',
  role: 'admin',
  roleLabel: 'Admin',
};

/** Partner / introducing agents — the "Agent" and "Agent Name" columns. */
export const AGENTS = [
  'Sheena Ericson', 'Terry Boren', 'Kelly Kaiser', 'Jennifer Hyatt', 'Christopher Earl',
  'Linden Martinez', 'Jillian Davies', 'Rachel Pope', 'Gayle Seder', 'Marcus Chen',
  'Paul Compton', 'Francis Hughes', 'Broadus Jones', 'Eric Weeks', 'Braden Taylor',
  'Linda Marsh', 'Ronald Hogan', 'Bernard Clooney', 'Eric Bolen',
];

/** Internal operators — the "Assigned To" / "Reviewer" columns. */
export const ASSIGNEES = [
  'Adam Prescott', 'Robin White', 'Evan Walker', 'Francis Hughes', 'Thomas Clarke',
  'Braden Taylor', 'Bailey Green', 'Alan Demoss', 'Taylor Rialls', 'Wilson Adams',
  'Marcus Fellowes', 'Chris Benson',
];

/** Participant-side contacts — the "Contact" / "Contact Name" columns. */
export const CONTACTS = [
  'Daniel Ashworth', 'Max Muller', 'Gary Blaze', 'Max Black', 'Marcus Fellowes',
  'Rachel Okafor', 'Priya Desai', 'Penny Leonard', 'Dan Hewitt', 'Nina Osei',
  'Priya Nair', 'James Okafor', 'Sarah Evans', 'Tom Griffiths', 'Oliver Shaw',
  'Andrew Simon', 'Rachel Webb', 'Marc Schwann', 'Brandi Allen', 'Derek Simmons',
  'Fiona Clarke', 'James Whitfield', 'Charles Horgan', 'Arthur Jackson', 'Ivy Monroe',
  'Simon Griffiths', 'Rebecca Turner', 'Nigel Watts', 'Graham Reid', 'Patricia Holmes',
  'Julian Evans', 'George Weston', 'James Gordon', 'Charmaine Blanc', 'Taylor Rialls',
];

/** Risk analysts who clear held volume — includes a team, not just people. */
export const ACTIONED_BY = [
  'Mark Finnegan', 'Donald Kossmann', 'Bucks Fisher', 'Risk Management Team', '',
];

/** Residual-earning agents shown on the "My Income" tabs. */
export const RESIDUAL_AGENTS = [
  { name: 'ACI admin', profileId: 'ACI000001' },
  { name: 'PayUK', profileId: 'House' },
  { name: '1st Grafton', profileId: 'A3213-1' },
  { name: 'Yvonne Hall', profileId: 'A3092-1' },
  { name: 'Huntingdon Garner', profileId: 'A3212-2' },
  { name: 'Eric Bolen', profileId: 'A4099-107' },
  { name: 'Michael Collester', profileId: 'A3010-2' },
  { name: 'Donald Kossmann', profileId: 'DK-01' },
];

/** Note authors on the Applications / Notes modals, with their note type. */
export const NOTE_AUTHORS = [
  { name: 'Wilson Adams', type: 'Public Notes' },
  { name: 'Sheena Ericson', type: 'Underwriting & Risk Notes' },
  { name: 'Marcus Chen', type: 'Secure Notes' },
];

const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, '.');

/** Deterministic work email for any person, on the tenant's domain. */
export const emailFor = (name, domain = 'ukpaymentsops.com') => `${slug(name)}@${domain}`;

export const initialsFor = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

export default CURRENT_USER;
