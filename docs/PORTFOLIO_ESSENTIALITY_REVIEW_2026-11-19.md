# Portfolio essentiality review

19 November 2026, Australia/Sydney.

## Initial findings

Essentiality is judged by what would be lost during a month without the project. Evidence of recurring use, operational dependency and irreplaceable data carries more weight than scope or feature count.

| Decision | Project | Evidence and limitation |
| --- | --- | --- |
| Most essential app | FaithHub | The daily prayer rhythm and requests to improve reminder fit establish recurring relevance. The public home and Go Deeper routes returned HTTP 200. Reminder adherence and real usage frequency are unknown. |
| Most important technical project | JoshMemory | The GitHub-backed shared handoff system and portfolio inventory support work across coding agents. Exact current adoption needs further verification. |
| First app to repair | Healthiest Food | Reported iPad failures affect recipe browsing and the start-cooking action. The Pages backup returned HTTP 200. The main deployment and iPad interactions were unverified. |
| Most important to preserve | Remembering Paul Roe | Public memorial plus a separate archival collection. GitHub Pages returned HTTP 200. The archival material gives the project lasting value. |
| Creative flagship | Repository Town | The original town and Narromine recreation form a distinctive project. JoshRS has stronger evidence of personal play through a long-running save. |
| Technical upside | AutoPatch | Historical run 44228590587 completed some read-only feed and audit steps. The job concluded cancelled and two coverage checks failed. This run does not establish portfolio-wide coverage or automatic repairs. |

The October register contains 233 repositories. Four connected GitHub inventory views returned 161 distinct repositories across the retrieved pages. Those views overlap with the register and include mirrors and experiments. The May portfolio audit and app list provided historical context. This review did not include a full playthrough or authenticated workflow test for every project.

Sources: [portfolio register](PORTFOLIO_TRIAGE_2026-10-24.md), [Repository Town](../repository-town/README.md), [FaithHub](https://github.com/Parris-Tech-Services/FaithHub), [Healthiest Food](https://github.com/joshualparris/HealthiestFood), [Paul Roe memorial](https://github.com/joshualparris/Paul-Roe).

## Follow-up findings

The original assessment above is retained as a dated snapshot. The follow-up distinguishes the value of a routine from reliance on its app, and the presence of a workflow from proof it runs successfully in production.

| Decision | Refined judgement |
| --- | --- |
| Strongest evidence of practical app use | **Healthiest Food.** Firsthand iPad reports identify specific interactions the owner tried. PRs [#25](https://github.com/joshualparris/HealthiestFood/pull/25) and [#26](https://github.com/joshualparris/HealthiestFood/pull/26) added the older-browser fallback and a deployed-site regression check. The [backup home](https://joshualparris.github.io/HealthiestFood/) contains a Browse Recipes link to the [classic 17-recipe page](https://joshualparris.github.io/HealthiestFood/recipes-classic.html), which returned HTTP 200 with the expected title. The actual iPad and the start-cooking interaction remain unverified in this review. |
| Strongest alignment with a personal priority | **FaithHub and Abide in Christ.** The reminders carry the daily rhythm themselves, which weakens the claim that the website is the most relied-on app. FaithHub also has standalone value through prayer material and the [merged public Cornerstone audio catalogue](https://github.com/Parris-Tech-Services/FaithHub/pull/23). Daily site visits and listening frequency are unknown. |
| Strongest case to preserve | **Remembering Paul Roe.** Public repo history records [submitted memories](https://github.com/joshualparris/Paul-Roe/commit/042c1321f8ac3f82bd6617bfacb8220dc85a4b75) and [service livestream and replay links](https://github.com/joshualparris/Paul-Roe/commit/5d2cabb6c080ad1c2dc42430ed65b7a5a9700b27). Contributions establish participation beyond the maintainer. Audience size and the completeness of archive recovery are unknown. |
| Technical foundation | **JoshMemory**, provisionally. Portfolio inventory and durable handoffs are already concrete uses. The evidence does not establish which agents currently depend on the shared store or how often they use it. The portfolio register alone is an observed use in this review. |
| Technical project with growing leverage | **AutoPatch.** Merged [#102](https://github.com/joshualparris/JoshDashboard4/pull/102) implemented a bounded HealthLens repair chain. Merged [#105](https://github.com/joshualparris/JoshDashboard4/pull/105) added scheduled dry runs and deployment verification logic. JoshMemory has [merged dependency maintenance](https://github.com/joshualparris/JoshMemory/pull/590), but the reviewed evidence does not attribute that merge to an unattended repair chain. The cancelled historical scan is a failed data point, not a current fleet-wide verdict. No verified unattended repair or production rollback was established here. |
| Personal exposure monitoring | **Josh Data Hunt.** [Repository evidence](https://github.com/joshualparris/JoshDataHunt/commit/9f0a7a5686f2e99b645a0459671e8aa2cfe25bc7) records synthetic delivery verification and a personal enrolment blocker. This is evidence of delivery plumbing, with actual watchlist monitoring still unverified. |
| Games | **Repository Town** remains the creative flagship. **JoshRS** remains the leading personal continuity case because a played save carries progress. Activity and automated browser coverage are insufficient to infer broader player demand. |

**Healthiest Food has demonstrated value when a cooking batch is due.** Josh confirmed he cooked ten meals last night and expects to need the app again when they run out. That moves it out of the immediate priority list. Abide in Christ remains the clearest ongoing personal routine in the evidence reviewed. FaithHub has the clearest connection to a daily value, while the Paul Roe material has the highest demonstrated cost of loss. These rankings are judgement calls. The review lacks comparable private usage data, a full audit of every deployment and proof of recovery for each archive or save.

## Values study cross-check

The 14 November values study covered 225 accessible repositories and placed the family-project cluster first for stakeholder relevance. Its inferred weights are a reference model. Its stakeholder tiers include intended beneficiaries, so they cannot establish adoption. Its commit shares measure repository activity, including agent work and mixed-purpose repositories. They cannot measure personal priorities or time.

The Ideas workflow was traced from material selection and filtering in `index.html` and `things.js` into guided play and browser-local outcomes in `play-mode.js`. A Node VM harness executed the source functions with a simulated DOM and fresh storage. It passed exact matching, guided-play lookup, saving an outcome and rendering the history after a fresh script load. This is a source-level check. The deployed endpoint redirected anonymous requests to sign-in, and local Chromium could not launch in the execution environment. Live interaction and household adoption remain unverified.

The SylvieApp and EliasApp2 public entry URLs responded to HTTP requests. Their source documentation and QA records describe child-facing play and local persistence. This review did not verify real-device interaction or recurring household use. The family cluster therefore leads on values fit, with Ideas a plausible co-play tool and no proven individual winner.

FaithHub has the strongest recorded evidence of a values-led feature shipped and tested on a deployment (see [verification report](VALUES_FAITHHUB_VERIFICATION_2026-11-14.md)). Remembering Paul Roe has stronger evidence of participation from outside the maintainer and remains the preservation priority. Healthiest Food has direct firsthand interaction evidence and serves a recurring batch-prep need. JoshMemory and AutoPatch are enabling infrastructure. No universal first-place ranking is supported by comparable usage evidence.

## Cross-session evidence update, 19 November 2026

The cancelled inventory run cited above predates subsequent AutoPatch work. [Threat watch PR 111](https://github.com/joshualparris/JoshDashboard4/pull/111) added scheduled checks for secrets, third-party website script changes and repository access changes. GitHub code search returned seven-day Dependabot settings in nine distinct repositories across the two main owners. This is a search lower bound. The other session reported 19 configured repositories and 88 tested PR merges. The underlying full lists and per-PR test results were unavailable in this review. Successful unattended production repair remains a separate question.

For Healthiest Food, the other session reported both Browse recipes and the start-cooking navigation worked on the live site using Chromium at iPad size. Physical iPad Safari behaviour remains unverified. These results update the earlier snapshot.
