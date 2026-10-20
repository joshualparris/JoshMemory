# Repository Town NSW-inspired emergency, police and criminal justice

20 October 2026. Fictional simulation, NOT an emergency service, law enforcement
system, legal advice, legal records or a NSW Government process. Authoritative
legal rules are more complex and are not encoded in full.

## Real-world primary-source grounding
* [Triple Zero 000 and NSW Ambulance response](https://www.ambulance.nsw.gov.au/our-services/emergency-services):
  The initial 000 operator asks for **Police, Fire or Ambulance** then directs
  the call to the relevant service. The Ambulance call taker asks detailed
  clinical questions, grades urgency, gives appropriate first-aid guidance
  and dispatches resources; not every call results in ambulance transport.
  Arriving by ambulance does NOT guarantee earlier ED treatment.
* [NSW Ambulance control operations](https://www.ambulance.nsw.gov.au/our-services/operations):
  Call taking, appropriate vehicle assignment and mobile data dispatch are
  separate stages. Travel/arrival depends on distance and resource availability.
* [NSW ODPP investigation, arrest and bail](https://www.odpp.nsw.gov.au/prosecution-guidance/steps-in-the-prosecution-process/investigation-arrest-and-bail):
  Reports are investigated; evidence precedes arrest/charge. Bail is separate
  from proof of guilt and is governed by the Bail Act 2013.
* [Legal Aid NSW on bail](https://www.legalaid.nsw.gov.au/my-problem-is-about/a-criminal-charge/bail):
  Police may issue court attendance notices without bail, release on bail,
  or refuse police bail. If not bailed a defendant must go promptly before
  court; bail conditions and review are case-specific.
* [Legal Aid NSW Local Court duty services](https://www.legalaid.nsw.gov.au/for-lawyers/policy-online/crime-policies/crime-policy-local-court):
  Eligible defendants can access duty lawyers for specified proceedings
  including bail, subject to tests; this must not be represented as a
  guaranteed automatically appointed lawyer.
* [NSW Local Court bail procedures](https://dcj.nsw.gov.au/content/dcj/ctsd/localcourt/local-court/about-us/jurisdictions0/criminal-jurisdiction/bail-procedures-and-forms.html):
  Police/court bail applications, risk assessment and court appearances.

## New staffed-service sites (south High Street)
* **K8 Police Station** — 24-hour public counter and communications office,
  evidence store, private interview room, short-term police holding cells.
  These ARE NOT a sentenced prison or unmonitored public cell access.
* **O8 NSW Ambulance Station** — 24-hour response unit, clinical stocks, crew
  communication board, decontamination and ambulance-bay equipment.
* **E8 Repository Town Local Court** — registry, public gallery, courtroom,
  confidential legal meeting area and separate secure holding area.
* **F8 High Street Solicitors** — reception, Legal Aid eligibility enquiries,
  workstations, client conference and controlled confidential case records.
* Existing **N8 Fire & Rescue** is dispatched alongside the new facilities.
* Existing **Q8 Clinic** provides local primary health care; hospital referral
  and corrections are outside the small town map in this first edition.
* No additional resident NPCs are created: pre-existing 38 work and sleep
  as before. Service resources are abstract dispatch units, not yet actual
  driving crews with road navigation.

## Exactly how an in-game 000 response works
The heading displays `🚨 000 (Game)`; this is a game panel, not a dialler,
never contacts any services, and does not use the device's phone permissions.
A genuine emergency in Australia requires calling 000 on a telephone.

1. Caller selects a medical collapse, road injury, reported building fire,
   suspicious noise or an alleged break-in/assault. Suspicious noise without
   immediate danger is redirected to station/nonurgent advice instead of
   consuming an emergency unit.
2. The simulation confirms incident type, caller map coordinates, requested
   Police/Fire/Ambulance units, priority and call timestamp. Calls are
   idempotent for an active identical report within 12 town minutes.
3. At least one minute later, operations assigns available police, ambulance
   and/or fire assets; a busy unit queues calls.
4. After dispatch, a unit proceeds `en-route`, then `on-scene` after an
   *illustrative* simulated travel delay. This is not a real NSW ETA.
5. Medical care assesses priority and scene hazards and records assessment,
   treatment and possible clinic/hospital transport. Not every patient
   requires ambulance transport.
6. Police reports trigger independent investigations; photographs, witness
   statements and chain of custody go into case records. Only evidence
   verified through the scene investigation can identify a defendant.
7. In the staged break-in and assault scenario an **explicitly fictional
   visiting suspect** (not one of the town's real 38 villagers) can be
   verified against independent recorded footage and scene witness records.
   The prosecutor/police can only charge after that corroboration, and legal
   advice is recorded. Simply pressing 000 never results in a conviction.
8. Bail is considered as a distinct risk decision; remand is not guilt.
   Lower-risk fictional property charges use illustrated conditional police
   bail; the serious injury scenario initially refuses police bail with
   judicial review. Initial Local Court mention is set for the next game day.
9. Magistrate hears the mention and disclosure and lists the defended hearing.
   The scripted court assesses whether independent corroboration plus a
   separate authenticated forensic report meets its simplified threshold.
   Without that report the game acquits rather than auto-convicting.
10. Only after a conviction can the magistrate impose an illustrative fine,
    or for serious violence a custodial term. Remand and any sentenced
    imprisonment take place **off-map with corrections**, never in the
    local police station. A person is released after completing the term.

## Important realism limits
- NSW courts do NOT decide cases using a fixed evidence-count formula.
  The game's training-court threshold is explicitly simplified; real
  magistrates evaluate all admissible evidence and legal submissions.
- Bail and sentencing depend on individual circumstances and legislation.
  The game's scripted examples are NOT legal guidance or default outcomes.
- The respondent is a separate fictional actor represented in case records,
  not an arbitrary resident NPC forced into guilt or jail.
- Vehicles shown outside stations are architectural; **true priority driving,
  route clearance, live 3D dispatch and hospital ED** are still outstanding.
- No actual telephone, AI dispatch, medical advice or external data leaves
  the game. No real emergencies are created.

## Tests
`node tests/emergency-justice.mjs`: in-game emergency call, nonurgent
referral, availability and busy queuing, on-scene care, evidence custody,
no arbitrary charge, lawyer referral, conditional bail, charge, court
mention, conviction with authenticated corroboration or acquittal
without proof, state save/restore, all four custom room layouts and
hotspot/exit reachability.
`npm run test:integration`: full town, NPC collision, economy, privacy
and published build gate. Public generated-site regressions separate.

Browser acceptance remains independently pending until tested on an
actual rendered Android/Chrome scene, including HUD, entrances and return exits.
