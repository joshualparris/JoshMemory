# NR-VQA-002 — fixed-pose Narromine real-WebGL screenshot regression

**State:** Implemented on branch; acceptance requires the recorded GitHub workflow, review and eventual source-SHA deployment. This is not evidence that Narromine is photo-accurate or that flicker has been eliminated.

## Why this is the next task

The 5 November [10-step Narromine visual QA plan](NARROMINE_VISUAL_QA_10_STEP_PLAN_2026-11-05.md) records NR-VQA-001's successful videos but no reliable fixed-pose geometry baseline. Small road/building/paint changes can therefore slip by unnoticed. This task implements **NR-VQA-002** without editing game scenes or conflicting with the claimed airport (#415), footprint (#418), and street-sign (#419) features.

## Exact source and baseline

- **Approved/reference commit:** `614c9af27821746df7f3e95978dea177b0fad921` (independently verified Pages /latest/ release from 5 November 2026). This is a technical **game baseline**, not a licensed real-street photograph or an endorsement that historic geometry is right.
- **Candidate commit:** exact checked-out PR SHA/merge checkout or manually dispatched current source; no local uncommitted geometry.
- **World/camera registry:** `tools/narromine-visual-qa/locations.mjs` (existing). Six fixed poses: Royal Hotel, Narromine Hotel, Post Office, Coles/Kierath's frontage, Kierath's arcade courtyard, and ordinary Nymagee residential street.
- **Viewports:** Chromium 1280×800 desktop at DPR 1; 393×852 mobile-sized Chromium at DPR 1 (**emulation, not a real phone**). Both use the same 1.65 m pedestrian eye height, canonical headings/pitch/FOV, midday 12:30 and clear weather.
- **Captured evidence:** 12 PNGs for approved baseline, 12 for candidate, image differences, full engine/graphics/camera/browser metadata, FPS/geometry, HTML reports and machine-readable `fixed-pose-review.json`. Uploaded to short-retention Actions artifact, never the game assets.
- **Privacy:** Both isolated source revisions run real build/privacy checks; no Google Street View pixels or private credentials imported into media.

## Interpretation — deliberately fail closed on invalid evidence

The pure contract rejects a missing/duplicate capture, wrong SHA, missing PNG, unsafe screenshot path, changed coordinates/yaw/pitch/eye/FOV, mismatched viewport/DPR/time/weather, errors, blank frames and absent geometry. The genuine PNG comparator calculates changed pixel ratio, RMSE and structural edge correlation. Reference/candidate differences beyond **0.8% changed pixels**, **RMSE 2**, or **edge correlation below 0.96** are labelled **`review-required`**, as are potential geometry regressions reported by the existing comparator. These thresholds are conservative **screen-space review gates**, not ground-truth accuracy thresholds.

A **`pixel-stable`** status means the model did not noticeably change at these poses, not that real Narromine is correctly modelled. A **`review-required`** status is not proof of a bug: it requires human checking against authorised dated references. An **`invalid`** status fails CI because valid comparison evidence is missing. Legitimate scene changes are not automatically approved simply to get a green workflow.

## How to run

The path-scoped workflow `.github/workflows/narromine-fixed-pose-regression.yml` runs on its own PR edits, and on manual workflow dispatch. It checks out pinned baseline in a separate Git worktree; builds both versions, installs software-WebGL Chromium, records real scene frames with the existing `run.mjs`, checks manifests and generates lossless PNG differences. It intentionally does **not** run on every geometry push (avoids unnecessary Actions minutes).

Unit contract:

```bash
cd repository-town
node tests/narromine-fixed-pose-regression.mjs
```

Comparison of two actual evidence folders:

```bash
node tools/narromine-visual-qa/fixed-pose-regression.mjs \
  --baseline test-results/nr-fixed-pose/baseline \
  --candidate test-results/nr-fixed-pose/candidate
```

## Acceptance and next ownership

- [ ] Unit contract PASS, real browser 24 images and metadata generated, review manifest uploaded.
- [ ] Source build/privacy and tests PASS. Investigate any run failure rather than disabling evidence gates.
- [ ] Review unusually changed images; preserve valid intentional redesigns, number unexpected defects.
- [ ] Merge after checks and no cross-agent file overlap; separately verify real deployed source SHA.
- [ ] NR-VQA-003: add *temporal road-mask* flicker measurements with static-scene controls (this task only handles fixed pose screenshots).
- [ ] NR-VQA-005: isolate road/paint/shadow layers to determine true z-fighting vs subpixel material aliasing.
- [ ] DANDALOO-001/002: use dated actual streetscape evidence and photos to fix measured incorrect kerbs, median boundaries, pavers, line paint and individual shopfronts; no inferred positions presented as reality.
