# Dandaloo Street — evidence-led tree chronology and species-to-place workflow

**What this is:** a street-corridor evidence dossier to help RepoTown look accurate from pedestrian eye level. **What this is not:** a current verified trunk-by-trunk species survey.

## Historical sequence (avoid temporal mixing)

| When | Source and spatial scope | Species/physical evidence | Correct modelling decision |
| --- | --- | --- | --- |
| **1917 onwards** | Dandaloo WWI memorial avenue planted from Scout Hall to Hargraves Corner and extended over following decades. [S06] | **Kurrajong**, `Brachychiton populneus` | Historical-only planting, not arbitrary 2026 street planting |
| **1934–35** | Dandaloo **north side of the railway line** [S06] | Kurrajongs removed for road bitumen sealing, later centre islands added | Don't render those historical north-side trees as present |
| **2017** | [Dandaloo Street Commons photo](https://commons.wikimedia.org/wiki/File:Narromine_Dandaloo_Street_002.JPG) [S14] | Actual photographed vegetation, median palm/broadleaf crown forms; no reliable species count from the picture alone | Historical reference **before** 2018 change, not current survey |
| **2018** | Dandaloo **south side of railway line** [S06] | Kurrajongs removed and replaced with **Manchurian Pear**, likely `Pyrus ussuriensis` by conventional horticultural usage; planting contract/cultivar not supplied | Species-supported street **section**, but don't invent individual GPS or survive-to-2026 status |
| **2019** | Moir design-development LA-101 **Dandaloo Street South** [S07] | Proposed design legend: Manchurian Pear, maple cultivar, pin oak and Canary Island Date Palm | **Plan-only** until dated as-built, aerial/street photos or Council planting schedule proves actual instance |
| **2023** | 42 Dandaloo Street SEE [S09] | Mature palms and evergreen street trees on divided roadway; hedges/lawn described | Photo-backed general form and median character, not per-trunk taxonomy |
| **2026** | User's street-level comparison and existing LiDAR exports [R01][R04] | Many canopy candidates and observed landscaping, species not assigned individually | Confirm exact positions/species before replacing or adding tree assets |

## Council Moir design palette — precise, but proposed

The 2019 attachment to the July Reports of Committees (project 1636, drawing LA-101) shows design-development plans around **Fourth Avenue / Derribong Avenue, Dandaloo Street, and Narromine Hotel/Council** as well as southern extensions labelled **Cathundril Street, Backwater Road and Minorbe Street**. [S07]

| Legend taxon | Name | What to look for | Status |
| --- | --- | --- | --- |
| `Pyrus ussuriensis` | Manchurian Pear | Spring white flowering, broad/crown deciduous leaves, autumn colour; verify not `P. calleryana` or hybrid with botanist | **2018 southern section replacement** reported; **2019 plan** also proposes |
| `Acer negundo` 'Sensation' | Manitoba/box-elder maple cultivar | Leaf architecture different from `Pyrus`; deciduous | **2019 planned only** |
| `Quercus palustris` | Pin oak (plan names Swamp Spanish Oak) | Deeply lobed oak leaves and acorns | **2019 planned only** |
| `Phoenix canariensis` | Canary Island Date Palm | Pinnate arching leaves and stout palm stem | **2019 planned only** (2023 mature palms in scene are not automatically this species) |

**Document transcription caution:** one layout legend renders `Pyrus usseriensis`, whereas botanical name is `Pyrus ussuriensis` and another legend uses the correct spelling. Keep source transcription and normalized name separate. [S07] 

**Wrong-town exclusion:** the *same PDF* contains a **Trangie** town-centre plant list including `Ficus microcarpa` 'Hillii', `Jacaranda mimosifolia` and `Brachychiton populneus`. Never treat those Trangie design labels as Narromine survey results. [S07]

## Observations to photograph (in order)

1. **Railway crossing and the southern memorial replacement:** image each surviving ornamental pear at trunk/base level with street side and nearby address marker. Compare season for leaf/flower morphology, but never infer exact count from the historic plaque.
2. **Northern retail corridor around Dandaloo/Deribong:** verify trees on side verges versus median, especially ornamental deciduous trees and historic palms. Record where a 2017 photograph disagrees with 2026.
3. **Council and Narromine Hotel frontage:** separate hotel-specific rear/aerial trees from kerbside plants; respect the existing evidence-based exclusion around the hotel. Review [hotel tree QA](../../../docs/NARROMINE_HOTEL_KERBTREE_QA_2026-11-04.md).
4. **42 Dandaloo and nearby median:** correlate 2023 development photos with 2026 views and 2023 LiDAR crown peaks, but require trunk confirmation.
5. **South beyond main retail:** check original 2019 proposed symbols against dated after-construction imagery. An unbuilt tree symbol remains `proposed`.

For each individual candidate produce `site_segment, side_of_street, trunk_lat, trunk_lon, position_uncertainty_m, photo_observation_date, source_image_id, botanical_features, scientific_name, taxon_confidence, planted_status, change_since_2018, evidence_links`.

## Modelling instructions for current game

- Do not simply replace the entire Dandaloo 2023 LiDAR set with Manchurian Pear. The documented programme covers a **specific section**, and older crowns/hotel/council trees differ.
- Use measured 2023 canopy radius/height only for the **matching** tree, after the trunk and photo line up. A 2018 pear may not yet have the typical mature 9–12m size described in a generic nursery guide. [botanical dimensions source in SOURCES.md](SOURCES.md#additional-botanical-morphologytaxonomic-sources-not-site-observations)
- The 2019 design's exact tree symbols can supply **proposed target planting points** with drawing/survey transformation and uncertainty, but not `existence_status: current` until verified.
- Leaf-level LOD: pears seasonal deciduous/white blossom; Kurrajongs evergreen broader irregular; maples/oaks deciduous but only for confirmed instances; palm geometry only where an individual palm's trunk is clearly photographed/identified.
- Do not modify current gameplay collision, planted median positions, hotel exclusions or road-paint work while collecting these facts.

## Site-to-individual evidence checklist

- [ ] Already-public records establish 2018 southern Dandaloo **species cultivar, numbers, location and planting log**.
- [ ] Download 2019 Dandaloo design source CAD/GIS (CRS and project control points) to reconstruct proposed locations.
- [ ] Check as-built plan / planting completion report and any 2024–26 replacement list.
- [ ] Verify current 2026 imagery by date and side of street.
- [ ] Triangulate and link each observable tree base to closest LiDAR candidate, with collision-safe radius and maximum allowable distance.
- [ ] Check cross-street/kerb alignment; an ornamental crown over the road may have a stem in the median.
- [ ] Get independent botanical review where pear species/cultivar or maple status is ambiguous.
- [ ] Create individual confirmed entries only after complete evidence chain.

References [S06, S07, S09, S14] in [SOURCES.md](SOURCES.md).
