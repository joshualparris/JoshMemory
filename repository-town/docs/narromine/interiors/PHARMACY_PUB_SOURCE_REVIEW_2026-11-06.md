# Pub source-hash review — 6 November 2026: Narromine Pharmacy (#493)

The pub's non-certifying source-fingerprint guard correctly rejected a change to `repository-town/src/main.js`. This review explicitly documents the scope of the new blob before updating the fingerprint. The change is restricted to `enterNarromineWorkplace`:

- Block entry to the exact named Narromine Pharmacy when the published regular trading hours say closed; no change to other businesses' ordinary entry conditions.
- Display the pharmacy's published business address rather than the generic Narromine address.
- Describe its furniture as *interpretive*, not a measured internal plan.
- Preserve all existing pub-specific code paths, liquor service, RSA refusals, cellar, toilets, exit and physical-certification assertions. This review does not certify any pub building compliance.

Previous audited main.js Git blob: `4af1eeb95da11c28d010e81f82f91059e240e03c`; reviewed candidate blob: `05005e4231f501dd0b1fe521bc94e50eaf61356c`.

This audit is **source-provenance only**. It does not change any RTPUB task status or claim a pub compliance finding. The full pub acceptance, town integration and browser tests remain required prior to merge.
