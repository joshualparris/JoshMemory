# Wambuul Nursery & Garden Centre — evidence and 3D design brief

Research date: 27 October 2026. Building: Repository Town expansion site `nursery` (Wambuul Nursery & Garden Centre). The previous game dispatched this site to a generic first-stage shop shell. The new `src/world/nursery-interior.js` uses the shared 14m x 18m walk-in shell, which is **game geometry** rather than a surveyed Australian nursery.

## Source-backed functional requirements

1. **Retail and stock areas:** Garden centres sell living plants and may include sales, office, work areas, storage and amenities. A realistic shop needs checkout, seedlings, mature plants, pots and potting media rather than only a generic reception desk. Source: https://www.umass.edu/agriculture-food-environment/greenhouse-floriculture/fact-sheets/garden-center-design-guidelines
2. **Water infrastructure:** NSW Government horticulture guidance notes greenhouse orientation, plumbing, water supply, road access, drainage, frost, sun and wind. A garden centre is an environmental working site, not just a retail shop. Source: https://www.nsw.gov.au/regional-and-primary-industries/agriculture/horticulture/starting-out-horticulture
3. **Efficient irrigation and drainage:** NSW water efficiency guidance identifies irrigation planning, water recycling and runoff management as key design concerns. Source: https://www.water.dcceew.nsw.gov.au/our-work/projects-and-programs/water-efficiency-program/water-saving-tips/nursery-sector-water
4. **Plant health and hygiene:** Greenlife Industry Australia recommends keeping plants off contaminated ground and controlling splashback, runoff and cross-contamination. This supports raised display benches and separation of plant-care activities. Source: https://www.greenlifeindustry.com.au/communications-centre-content/media-releases-1/2022/root-pathogens-prevention-and-management-in-nursery-production
5. **Heat protection:** Industry guidance discusses shade-cloth selection and ventilation in hot nursery environments. Shadehouses and external growing space are a logical future extension, but this first iteration does **not** model a surveyed shadehouse. Source: https://gina.org.au/togetherwegrow/managing-heat-stress
6. **Water quality:** The WA Government's nursery and garden centre guidance covers potential water contamination, waste and runoff management; WA-specific requirements should not be mistaken for binding NSW regulations. Source: https://www.wa.gov.au/government/publications/wqpn-32-nurseries-and-garden-centres
7. **Technical depth:** NSW DPI's `Managing Water in Plant Nurseries` includes water testing, filtration, disinfestation, top/bottom watering, fertigation and drainage; detailed plant production infrastructure remains outside the first retail interior. Source: https://www.tocal.nsw.edu.au/publications/horticulture/managing-water-in-plant-nurseries

## Model specification and evidence tiers

- Entry: existing High Street shell with visible 2.4m entrance opening, unobstructed central aisle and correct exit trigger. **Game geometry, tier D**.
- Checkout and plant advice: low counter, payment screen, baskets and customer interaction. **Generic retail inference, tier C**.
- Indoor and flowering plant displays: raised benches, pots and foliage. **Tier C**.
- Native and drought-tolerant plants: distinct planting range, relevant to inland NSW. **Tier C**.
- Seedlings and propagation: low display benches with trays, separate from mature plants. **Tier C**.
- Pots and bagged growing media: consolidated near rear stock wall. **Tier C**.
- Water-saving demonstration: non-operational explanatory feature rather than simulated working plumbing. **Tier C**.
- Staff/storage/receiving: full working yard, washdown, loading dock, quarantine and irrigation plant room **not yet modelled**. Do not claim production-nursery completeness.
- Accessible circulation: 2.5m visual central walkway and fixture blockers, but no certified NCC/AS 1428 clearance assessment. **Tier D**.

## Test acceptance criteria

- Enter via street-facing entrance without a crash.
- All six interactive zones can be approached without colliding with benches.
- Exit returns to the front threshold rather than the rear wall.
- Visualise native plants, indoor stock, seedlings, checkout and supplies as physically different objects.
- Check both desktop and Android-sized touch layout and runtime errors.
- No falsely claimed compliance with AS 1428, NCC, fire codes or horticultural chemical storage requirements.
- Follow-up exterior work: shadehouse, visible irrigation infrastructure, loading/receiving bay, garden beds, exterior signage, landscaping, climate-appropriate stock and external customer circulation. Exterior changes have **not** been implemented in this commit.

## Limitations

The sources describe horticultural and retail best practices, not the real dimensions of a fictional Wambuul business. This is a researched **first implementation**, not a 100%-realistic full commercial nursery. Live gameplay and visual inspection are required before declaring the model finished.
