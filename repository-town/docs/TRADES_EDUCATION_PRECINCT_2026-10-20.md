# Repository Town: vocational precinct, trade repairs and Australian qualifications
20 October 2026. Simulation specification for the town. All named businesses,
staff, rates, course durations, qualifications and trades licences in this game
are fictional representations; they are not real NSW registrations.

## Geography
Existing north High Street **P8 School** continues school-age education.
Across the road on **south street 8**, after U8 Motor Workshop:
- **V8 Central West Hardware & Timber**: timber racks, plumbing, electrical,
  fasteners, repair parts, paint station, paid transactions with finite stock.
- **W8 Town Trades & Maintenance**: electrical, plumbing and carpentry bays,
  qualifications/contractor list, job bookings, quotes, safety check and signoff.
- **X8 Town TAFE Trades Campus**: classroom, practical training bays, trade
  learning/assessments and simulated AQF 1–6 qualifications.
- **Y8 Regional University Study Centre**: computer and engineering lab, library,
  supervised projects and AQF 7–10 offerings.

These are independent premises with a common safe front door, not a replacement
for the Motor Workshop, school, public works, university elsewhere or existing
property titles. New properties automatically appear in the deed registry.

## Physical repair jobs
1. A visitor files a **specific fault**: tap, blocked drain, faulty electrical
   circuit, damaged verandah or IT device. The fault remains an open ticket.
2. A written itemised fixed-price quote includes 15 TD inspection, material
   costs from the hardware store and labour by job category.
3. Payment is **not** taken until acceptance. Acceptance requires funds,
   inventory and an eligible contractor with an appropriate registered
   in-game licence for regulated electrical/plumbing/building work.
4. On booking, only the required physical items are removed from hardware.
   Their sales revenue goes to hardware; labour + inspection held in escrow.
5. Work advances over several simulated town hours. A job is assigned, starts,
   progresses and requires qualified signoff before payment is released.
6. Unstarted jobs can be cancelled for a full refund, with physical materials
   restored. Completed jobs cannot be cancelled. Receipts and jobs persist
   across save/restore.
7. Further work needed for full realism: actual work-vehicle dispatch and on-site
   work animations, inspection failure/rework, warranty claims, subcontractor
   scheduling, restocking by freight truck, council faults integrated into this
   scheduler and detailed Australian Standard compliance checks.

## Current job quotes (fictional Town Dollars)
| Fault | Licensed category | Stock | Labour | Total |
|---|---|---|---:|---:|
| Leaking tap | Plumbing | 2 sealant, 1 pipe | 45 | 87 |
| Blocked drain | Plumbing | 2 pipe, 1 sealant | 70 | 121 |
| Faulty lighting circuit | Electrical | 1 cable, 1 switch | 85 | 153 |
| Damaged verandah | Building | 4 timber, 3 fasteners, 1 paint | 90 | 177 |
| Faulty laptop | General IT (not electrical fixed wiring) | 2 parts | 40 | 79 |

Recalculate from `REPAIR_TYPES` and `HARDWARE` in source if prices change.

## Australian education
HSC is a senior secondary NSW award, **not** a Certificate III and not
an AQF-level qualification. AQF includes:
- Level 1 Certificate I
- Level 2 Certificate II
- Level 3 Certificate III
- Level 4 Certificate IV
- Level 5 Diploma
- Level 6 Advanced Diploma and Associate Degree
- Level 7 Bachelor's Degree
- Level 8 Honours Bachelor, Graduate Certificate, Graduate Diploma
- Level 9 Master's Degree
- Level 10 Doctoral Degree

The playable course chain includes HSC, Cert I/II/III electrical/III plumbing,
Certificate IV construction, Diploma, Advanced Diploma, Bachelor of Engineering,
Honours, Graduate Certificate, Graduate Diploma, Master of Engineering and PhD.
Each enrolment enforces a prerequisite, costs finite in-game money, takes
distinct scheduled town days and registers a **town-only** credential after
the simulated assessment. Time is intentionally compressed for a playable game.
Newly qualified players **do not** automatically receive an NSW electrical,
plumbing, builder's or contractor licence. Real qualifications require an
accredited RTO or higher-education provider, supervised industry experience,
formal assessments and relevant regulator approvals.

## NSW licensing rules guiding the simulation
- Electrical wiring in NSW requires the appropriate NSW licence or certificate
  regardless of job value. Electrical apprentices work under supervision with
  requirements varying by experience. Source:
  https://www.nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations/electrical
  https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/electricians/supervision-practice-standard-for-licensed-electricians-supervising-apprentices
- Plumbing, drainage and gasfitting require the correct category of licence/
  certificate. Plumbing apprentices without a licence require immediate
  supervision by an appropriately authorised person. Source:
  https://www.nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations/plumbing-draining-and-gasfitting
- NSW company/partnership contracting in regulated trades requires appropriate
  contractor licensing and nomination of qualified supervisors; general
  residential building contracting is subject to separate thresholds and rules:
  https://www.nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations/company-and-partnership-licences
- Australian AQF levels and professional education regulation:
  https://www.teqsa.gov.au/how-we-regulate/acts-and-standards/australian-qualifications-framework

These links describe the real-world system, **not** official endorsement or
accurate real-world pricing. The game does not certify anyone to carry out
dangerous or regulated work.

## Architecture
- `src/world/trade-education.js`: independent finite-money, licensing, jobs,
  education and save-state model under `life.civic.tradeEducation`.
- `src/world/trade-education-interiors.js`: four distinct walk-in venues.
- `src/world/life.js`: new properties and clock integration; existing
  farm, town power, municipal repair and 38-villager rosters preserved.
- `src/world/townlife.js`: four separately authored exteriors.
- `src/ui/trade-education-panels.js`: transactions, receipts, course progress.
- `tests/trade-education.mjs`: finance conservation, eligibility, legal
  separation, collision and save/restore regressions.

No real-world trade license number or school credential is stored or issued.
