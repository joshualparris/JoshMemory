# RTPUB-001 — NSW pub classification, use, age and approval assessment

**Location:** The Merged Branch, Repository Town **N8-S**, asset key **B:pub**.
**Assessed:** 25 October 2026, for the fictional game location. **Research assessment: COMPLETE; formal code compliance/real-world approvals: UNVERIFIED / not applicable to a fictional property.**
**Canonical qualified key:** `PUB-CODE/RTPUB-001`. The earlier separate utilities pilot also uses `RTPUB-001`; it is now disambiguated as `PUB-UTIL/RTPUB-001` without renumbering either legacy task.

## 25 October 2026 revision — original construction and immersive history now canon

**Built 1911, opened for trade 1912** as the fictional *Branch Line Hotel*, renamed *The Merged Branch* in **2019**. **Age in October 2026: 115 years.** These are deliberate fictional Repository Town facts, modelled as [gameplay history with source comparisons](PUB_FICTIONAL_HISTORY_1911.md), a readable pub plaque and Federation-style frontage.

**Regulatory distinction:** the pub is now treated as an **existing 1911 fictional building with 2026 improvements**, not a new 2026 construction. NSW NCC 2022 Amendment 2 applies to new work where triggered; untouched older construction is evaluated against its particular prior lawful status and applicable upgrade mechanisms, not automatically all current new-build rules. The original local building code, permits, historical licences, real-world heritage listing and fire safety schedule are still **unknown / not issued for this game**. The upper floor and footprint discrepancy remain unresolved under RTPUB-002. This section supersedes older 'construction date UNKNOWN' or '2026 new build' statements below if any remain.

## 1. The actual intended uses assessed

| Game evidence | Use/extent | Building class assessment | Certainty |
|---|---|---|---|
| `src/world/life.js` id `pub`, address N8-S, 11:00–23:00 service | Bar operating as a fictional country pub, liquor and meals sold to patrons | **Provisionally Class 6** under NSW-specific `NSW A6G7` | High for *declared game use*, provisional for the complete building |
| `src/world/pub-interior.js` bar, stools, bistro tables, kitchen pilot | On-premises bar, seated dining and food preparation ancillary to the public hospitality use | Class 6 floor-use working assumption; food safety rules separately apply | High for game function; no approved floor plan |
| Pool/darts, Keno/TAB-style screen | Incidental leisure/display at pub, no evidence of a separate casino/gaming machine room | No **independent Class 9b / gaming licence** inferred from decorative props | Medium, subject to actual use |
| Decorative fireplace and lounge | Ancillary public lounge | Assume same Class 6 part, check actual installed heat/fire systems separately | Provisional |
| External upper row of windows; no usable upstairs interior | **Unresolved exterior/interior conflict**: exterior has two tiers of windows and ~7 m height; interior is one 14×18 m room with 4.7 m top, unlike 14×11 m exterior depth | **Do not classify or occupy a hypothetical upstairs** without resolving RTPUB-002. Potential additional use/upper escape needs fresh classification. | Explicitly unknown |
| Railway Hotel at I8-S | **Different building** from B:pub. It has accommodation gameplay, but its rooms do **not** count as Merged Branch accommodation. | No Class 3 accommodation assumed at the pub. If pub rooms later added, review Class 3/other relevant class depending on lawful design. | Confirmed separate game asset |
| Function hall, concert/dance venue or independent assembly | Not implemented by pub-specific generator as an independent assembly space | Consider Class 9b only if use/extent creates a distinct assembly use; **NSW A6G7 specifically includes a small live-music or arts venue** so ordinary small performances alone do not compel Class 9b. | Future change assessment |
| LPG cylinders, storage, kitchen back-of-house | Ancillary restaurant support; finite 90 kg fictional LPG inventory in `pub-utilities.js` | Don't add Class 7b merely because of storage; fire/hazard conditions and ancillary use require specialist assessment | Unknown installation suitability |

**Precise legal provision:** NCC 2022 consolidated NSW Schedule 5 substitutes `NSW A6G7` for ordinary `A6G7`: Class 6 covers retail services, cafes/restaurants, hotel/motel dining/bar and **small live music or arts venue**. This is more useful than generic national Class 6 guidance alone. Refer [ABCB NCC 2022 consolidated, NSW Schedule 5 p177](https://ncc.abcb.gov.au/sites/default/files/resources/2025/ncc2022-consolidated-performance-requirements.pdf) and [NSW NCC page](https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/how-to-comply-national-construction-code).

**Planning land-use ≠ NCC classification ≠ liquor licence:** A `pub` is a distinct food-and-drink land-use category; NCC Class 6 is the building classification for the modelled bar/bistro scenario. A fictional hotel's liquor licence is an **operational assumption**, not a building code class, a liquor authorisation, or proof of licensed boundaries. Hotel and general-bar liquor licences have different permissions (notably takeaway and gaming machines); exact licence choice still requires a licensed floor plan and authorisations. [NSW liquor licence guidance](https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/liquor-licensing/licence-types/hotel) · [Hotel or general bar application](https://www.service.nsw.gov.au/transaction/apply-for-a-hotel-or-general-bar-liquor-licence).

## 2. Exact date and construction-code applicability

| Hypothetical case | Correct assessment |
|---|---|
| **Fictional new Class 6 pub submitted for construction in October 2026** | Use NSW **NCC 2022 Amendment 2** as the current baseline (commenced **29 July 2025**), Volume One BCA and applicable NSW variations; Volume Three PCA for plumbing/drainage. |
| CDC lodged on or after 29 July 2025 | Generally assessed under NCC 2022 Amendment 2 at lodgement, subject to lawful exceptions and relevant transitional rules. |
| Most CC applications lodged on or after 29 July 2025 | Generally NCC 2022 Amendment 2, with special date rules for multistorey buildings and multiple CCs. Never choose an old edition without actual lodgement/staging records. |
| An **existing** physical pub built or approved earlier | **Year built, approvals, existing lawful use and scope of alteration all unknown.** Do **not** demand automatic full 2026 retrospective compliance for all untouched fabric. Work/new use may trigger modern assessment and existing-building fire/access upgrades. |
| NCC 2025 | NSW Government has **deferred adoption until 1 May 2027**. Do not assess an October 2026 application as if NCC 2025 were already mandatory. |

Relevant primary sources: [NSW NCC adoption and CC/CDC date guidance](https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/how-to-comply-national-construction-code), [25 March 2026 Ministerial announcement](https://www.nsw.gov.au/ministerial-releases/nsw-to-adopt-new-national-construction-code-may-2027), [certifier FAQs updated 22 October 2026](https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/building-certifiers/practice-advice/frequently-asked-questions).

**Chosen current game design assumption:** treat the pub as an **existing, fictionally constructed 1911 Class 6 bar/bistro** with new kitchen/WC service work modelled in 2026. The code baseline applies to relevant new works and alterations, not an invented newly constructed 2026 building. The fictional pub was **constructed in 1911**, started trading in **1912**, and was renamed in **2019**; its original governmental approvals remain unverified. An unmodelled upper floor is **not authorised by this assumption**. This fixes the applicable *design comparison baseline*, not any actual development consent.

## 3. Approvals and building-age evidence ledger

These are **documents a real NSW project might need**. They do not exist for this fictional address, and their absence in this game is not an assertion that a real owner has breached the law.

| Required evidence / approval | Status for B:pub | Verification/resolution |
|---|---|---|
| Real cadastral lot, title, zoning, address, existing lawful-use history | **Fictional / not applicable**, no real NSW land parcel matching game N8-S asserted | Do not query third-party building records as if N8-S were a real survey address |
| Construction year / approved original BCA/NCC edition | **1911 — fictional canon** | `constructionYear: 1911` and `originalCodeEdition: null`; no retrospective invented NSW approval record |
| DA/development consent and its conditions (when required) | **NOT ISSUED for fictional game** | For a real site, establish applicable planning pathway, DA/consent or exempt/CDC decision and conditions; no invented DA number |
| CDC (if legally eligible and chosen) | **NOT ISSUED** | Alternative complying route requires eligibility and certifier approval, not automatically available for every pub |
| CC + certified architectural/site drawings for DA pathway | **NOT ISSUED** | Certifier compares future works against consent, NCC date and documentation |
| Occupation certificate or lawful-use evidence | **NOT ISSUED** | Real new/change-of-use building normally needs an OC subject to lawful exemptions; fictional pub has no government certificate |
| Fire safety schedule / relevant fire safety certificate | **NOT ISSUED** | Required where trigger applies; actual essential measures depend on approved design and schedule |
| Hotel/general bar liquor licence and licensed floor boundaries | **NOT ISSUED** | Do not imply the front door sign or Keno display establishes a licence |
| Council food premises registration and any relevant trade-waste approvals | **NOT ISSUED** | Separate food/health and local council obligations, not NCC classification evidence |
| Occupancy floor area, patrons/staff capacity, accessible routes, fire engineering | **NOT ASSESSED under RTPUB-001** | RTPUB-002…034 retain their own open acceptance requirements |

NSW Planning explains that a **change of use can sometimes be exempt** if specific Codes SEPP conditions are met. This is not a general exemption for opening a pub, changing a different shop into a pub, or carrying out construction; existing lawful use, zone, building compliance and actual physical scope must be checked. [Planning change-of-use pathway](https://planning.nsw.gov.au/the-planning-system/development-assessment/planning-approval-pathways/development-types/change-use). Dubbo Council advises **most** new retail food businesses will require a DA, and retail food premises including bars and hotels must register: [Council guidance](https://www.dubbo.nsw.gov.au/Business-Investors/Business-Responsibilities/food-business-responsibilities). NSW outlines DA/CDC/CC/OC routes: [approvals](https://www.nsw.gov.au/housing-and-construction/building-or-renovating-a-home/preparing/approvals), [occupation certificates](https://www.service.nsw.gov.au/transaction/apply-for-an-occupation-certificate), [Dubbo Council application types](https://www.dubbo.nsw.gov.au/Builders-Developers/Overview-of-Application-Process/types-of-das). A tailored [fire safety schedule](https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/building-certifiers/forms-and-templates/fire-safety-schedule-template) lists specific approved measures.

## 4. Acceptance for RTPUB-001 (research task) and explicit remaining work

- **COMPLETE — current NSW construction-code edition/date established**; not incorrectly applying NCC 2025.
- **COMPLETE — bar/bistro/ancillary use classified provisionally as NSW Class 6** with relevant NSW A6G7 exception for small music/arts venues.
- **COMPLETE — separate hotel/accommodation not imported into pub building classification**, and potential 9b/3 ancillary uses correctly left conditional.
- **COMPLETE — fictional existing 1911 pub, opening 1912, with applicable new work in 2026 assessed under modern NSW requirements; original permits and historic local rules unverified.**
- **COMPLETE — DA/CDC, CC, OC, FSS, liquor/food approvals documented as a conditional approval pathway**, not fabricated.
- **NOT COMPLETE — code compliance or actual approved building classification**. The pub has no real consent, occupancy or physical inspection; later work must be assessed by licensed experts if translated into real construction.
- **OPEN RTPUB-002/003**: exterior/interior dimensions, actual storeys, occupancy; these are material prerequisites for calculating exits, sanitary fixtures, access and fire.

**Conclusion:** RTPUB-001's defined *assessment and design-assumption deliverable* is finished. **No real building permit, code-compliance certificate, licence or inspection was obtained or claimed.**

## 5. Evidence record

| ID | Primary source | Use |
|---|---|---|
| NSW-01 | https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/how-to-comply-national-construction-code | Current code dates, NSW exceptions, BCA/PCA, CC/CDC applicability |
| NSW-02 | https://ncc.abcb.gov.au/sites/default/files/resources/2025/ncc2022-consolidated-performance-requirements.pdf | NSW A6G7 precise Class 6 variation, Schedule 5; NCC consolidated 2022 reference |
| NSW-03 | https://planning.nsw.gov.au/the-planning-system/development-assessment/planning-approval-pathways/development-types/change-use | Change-of-use planning rules and exempt conditions |
| NSW-04 | https://www.nsw.gov.au/housing-and-construction/building-or-renovating-a-home/preparing/approvals | DA/CDC/CC approval framework |
| NSW-05 | https://www.service.nsw.gov.au/transaction/apply-for-an-occupation-certificate | Occupation certificate process |
| NSW-06 | https://www.dubbo.nsw.gov.au/Builders-Developers/Overview-of-Application-Process/types-of-das | Dubbo Council OC route |
| NSW-07 | https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/building-certifiers/forms-and-templates/fire-safety-schedule-template | Fire safety schedule triggers |
| NSW-08 | https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/liquor-licensing/licence-types/hotel | Hotel liquor licence is different from building classification |
| NSW-09 | https://www.dubbo.nsw.gov.au/Business-Investors/Business-Responsibilities/food-business-responsibilities | Dubbo food registration and likely DA |
| NSW-10 | https://www.nsw.gov.au/ministerial-releases/nsw-to-adopt-new-national-construction-code-may-2027 | Future NCC 2025 adoption |
| NSW-11 | https://www.service.nsw.gov.au/transaction/apply-for-a-hotel-or-general-bar-liquor-licence | Hotel versus general-bar licence distinctions |
| NSW-12 | https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/building-certifiers/practice-advice/frequently-asked-questions | Existing building alteration and certificate differences |
| NSW-13 | https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/liquor-licensing/apply-manage/apply-liquor-licence | Licence choice depends on business activity |

**Code read:** `src/world/life.js`, `shop-interior.js`, `pub-interior.js`, `interior-kit.js`, `townlife.js`, `pub-utilities.js`, `docs/PUB_UTILITIES_PILOT.md`, `audit/electricity/coverage.json`. The companion dated [source audit](PUB_NCC_2026_COMPLIANCE_AUDIT.md) preserves other numbered standards findings. Research status is independent of software deployment and legal certification.
