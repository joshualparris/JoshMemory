University, TAFE, hardware and trades interiors had no local lights; streetlamp heads glowed without lighting surrounding surfaces. Add independent interior light circuits and visible fixtures, bounded downward streetlights, readable sign washes and correct shop/household schedules.

RLT-001–010 local implementation/access/integration checks passed. RLT-011 publishes scoped source, exact task IDs and evidence; RLT-012 review/merge and RLT-013–016 hosted release acceptance remain separate. No NPC/dialogue/audio/main.js changes. Current main ee432c0 preserved, including yarn settings and hosting drift guard.

Validation: f2053e1 full npm run build:release PASS; privacy scan 774 files/1116 markers; 1140 release files verified. All five uploaded runtime files are byte-identical to reviewed source; core runtime unchanged since e72a654, whose 38 desktop/emulated Android browser scenarios passed with no runtime/shader errors and no blocked locations. Evidence in repository-town/docs/LIGHTING_AUDIT_2026-10-24.md and audit/lighting/.

Self-review: bounded allocation, scene/window pass visibility, atlas orientation, overnight/24h/household intervals, circuit restoration and preserved combined release tests. No blocking code findings. Physical handset performance and actual gameplay outage acceptance stay open under RLT-017/018.

User approved push/review/merge/deployment. GitHub browser fallback successfully writes; CLI and connector remain unavailable. Use existing tested host fallback if Vercel is quota-blocked. No hosted success claimed before matching release fingerprint and live browser checks.
