# Repository Town — Parallel Agent Coordination Rules

**Status:** Shared cross-agent policy · **Maintainer:** Josh · **Effective:** 4 November 2026  
**Canonical source:** This file on `main` in `joshualparris/JoshMemory`.  
**Related living records:** [Agent instructions](../AGENTS.md), [Coordination board](../COORDINATION.md), [Work checkpoint](../WORK_CHECKPOINT.md).

## Purpose

Allow several coding agents to improve the same street or town simultaneously **without** claiming entire areas, duplicating geometry, discarding concurrent work, or misreporting verification. These rules supplement (not supersede) the repo's existing agent, privacy, release and task-specific instructions.

## 1. Claim specific features, systems or buildings — not entire streets

Record the smallest independently reviewable task in `COORDINATION.md`, not a geographic monopoly.

**Good claims:** Dandaloo angled parking markings; median vegetation; historic shop awnings on a specified frontage; Narromine railway boom gates; streetlight pole placement; reusable asphalt material atlas; Narromine Hotel public interior.

**Too broad:** "all of Dandaloo Street", "Narromine streetscape", "every Narromine building", "all road improvements".

A claim must include:
- Agent identity and machine, exact feature/task and geographic extent *where relevant*.
- Branch, baseline SHA, predicted file paths and integration interfaces.
- Dependencies and likely conflicts with other active work.
- Status, tests/evidence, next action and time/date of last update.

Release claims when done. Historical 'in progress' lines are not necessarily current: inspect branch and PR status before treating them as exclusive.

## 2. Geographic overlap is allowed; feature and data ownership matter

Multiple agents may work along Dandaloo Street simultaneously: one on kerbs and parking, another on individual buildings and awnings, another on trees and street furniture, another on illumination, another on automated visual QA. The work may share coordinates, but it must **not** define competing versions of the same feature.

Before implementation, check whether an existing builder already creates the asset. Identify the existing authoritative data and renderer. New code must replace or integrate cleanly with existing geometry; never draw duplicate models, awnings, road polygons or collision meshes.

If a specific building is owned by another agent, submit evidence and required corrections to that agent or the coordination board instead of independently replacing its model.

## 3. Shared files are coordination points, not exclusive territory

Prefer purpose-specific modules and small integration changes. Suggested optional module names:
- `src/world/narromine-road-markings.js`
- `src/world/narromine-street-vegetation.js`
- `src/world/narromine-street-furniture.js`
- `src/world/narromine-shop-awnings.js`
- `src/world/narromine-surface-materials.js`

**These are suggestions, not commands to replace existing modules.** Inspect actual code and avoid duplicating implemented functionality.

Several agents may need `src/world/narromine.js`, `narromine-layout.js`, `COORDINATION.md` or test manifests. Coordinate the integration points and make minimal, narrowly scoped edits. No agent exclusively owns a shared integration file.

## 4. Use one consistent geographic and rendering contract

All features must use the existing world/geographic transform, street centreline or kerb references, building footprints, ground elevations, orientation and measurement units. Record sources, observation dates and uncertainty. Avoid incompatible local transforms and hardcoded independent offsets.

Define interfaces for road/kerb/footpath boundaries, median planting extents, pole and awning anchors, material conventions, collision surfaces and shadow/depth offsets. An overlapping road texture or polygon that flickers is a defect, not acceptable layering.

For buildings and vegetation, use real photographs, aerial imagery, cadastral data and LiDAR where available; distinguish verified geometry, estimated details and fictional gameplay elements.

## 4a. Strict real-location evidence for Narromine objects (Josh, 4 Nov 2026)

**A real place at a real coordinate is not permission to add objects that were never observed there.** For trees, poles, overhead wires, signs, windows, roofs, awnings, parking details and street furniture, record individual location-specific evidence before rendering a purportedly real object. `OpenStreetMap` road centrelines, generic building classes and municipal concept designs **do not** prove where every tree/lamp/awning exists. A fixed-spacing generator with no real object-level observations must not invent real-world street furniture.

**Estimated dimensions are permitted when the object itself really exists at that location**, supported by dated Street View/local photos, an appropriately licensed aerial capture, NSW cadastral/LiDAR evidence or equivalent. Record coordinates, source identifier, date, confidence and which attributes are approximate. The exact shape may be an approximation; the *presence/location* cannot be made up. When evidence is absent or conflicts, leave the object unrendered or explicitly segregate it into a labelled fictional/interpretive mode rather than presenting it as real Narromine.

Street View is a visual cross-check, not an unrestricted texture or data redistribution licence. Use NSW/open data for reproducible geospatial measurements and honour each source's licence. Do not blindly strip source-grounded approximations or historic features. Apply these evidence rules **per feature**, using the coordination claims and CI contracts, and preserve parallel agents' evidenced work.

## 5. Protect parallel work throughout development

1. Read `AGENTS.md`, `COORDINATION.md`, `WORK_CHECKPOINT.md` and related plans; fetch `origin/main` before claiming.
2. Check active PRs and current merged code, not just past agent summaries.
3. Record a **precise** claim and start checkpoint; use a dedicated feature branch.
4. Commit small, reviewable milestones and update checkpoints as required by repository instructions.
5. Fetch/reconcile the latest `main` before merge; resolve conflicts by preserving the intended contributions of both sides. Do not blindly choose 'ours' or 'theirs'.
6. Never force-push over another agent's changes, silently reset shared branches, or overwrite unrelated files.

## 6. Require integration and evidence-based acceptance

Run proportionate Node, geometry, build, privacy and browser tests for the changed feature and its neighbours. Include desktop/mobile visual checks when changing rendered geometry. Check for:
- Duplicate or missing buildings and meshes, z-fighting, flickering roads, shadow issues and bad depth ordering.
- Walkability, road driveability, collision boxes, entry/exit points and save/load integrity.
- Performance and lighting across multiple camera positions and times of day.
- Geographical and photographic consistency with documented reference material.

A passing Node test alone does not prove photographic accuracy. A merged PR alone does not prove a live deployment. Preserve source photography licence restrictions: do not publish third-party photos in the repository without rights.

Only report **VERIFIED COMPLETE**, **PARTIALLY COMPLETE** or **BLOCKED**, with actual test output, screenshot locations, PR/commit and live release evidence. Follow the existing privacy and deployment requirements in `AGENTS.md`.

## 7. Lightweight cross-agent handoff template

```text
Owner / machine:
Task ID and precise feature:
Geographic extent (if relevant):
Branch / baseline SHA:
Files / integration points:
Shared geospatial or material interfaces:
Dependencies / risks of overlap:
Evidence and acceptance tests:
Current status / next action:
```

## Guiding principle

**Coordinate by feature ownership and shared interfaces, not arbitrary geographic boundaries.** The objective is many independent improvements becoming *one* consistent, accurate and playable Narromine.
