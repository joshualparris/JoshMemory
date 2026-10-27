# Spatial verification supplement — independently calculated from current rectangles
Date: 27 October 2026. This supplement supersedes imprecise frontage claims in earlier planning notes.

## Reproducible method

For two axis-aligned rectangles centred at (x,z), with width w and depth d, their positive horizontal separation is `max(0,abs(x1-x2)-(w1+w2)/2)`; vertical separation is analogous. A proposed frontage requires at least touching a public-road reserve, but mere touching is **not** legal access or a suitable driveway. I reproduced these calculations independently from the 12 parcel and six road literals in `src/world/town-planning.js`.

| Parcel | Area m² | Closest visual road | Minimum gap (m) | Visual contact? |
|---|---:|---|---:|---|
| W-R1 | 9,460 | west-collector | 16.5 | No |
| W-R2 | 11,220 | west-access | 0 | Yes, but isolated road |
| W-C1 | 10,120 | west-collector | 16.5 | No |
| E-B1 | 11,000 | east-collector | 16.5 | No |
| E-L1 | 14,080 | east-access | 0 | Yes, but isolated road |
| E-R1 | 10,120 | east-collector | 16.5 | No |
| N-C1 | 20,700 | north-connector | 13.0 | No |
| N-R1 | 19,550 | north-connector | 13.0 | No |
| N-R2 | 18,400 | north-connector | 13.0 | No |
| S-R1 | 22,800 | south-connector | 5.5 | No |
| S-AG1 | 28,600 | south-connector | 5.5 | No |
| S-AG2 | 35,200 | east-collector | 0 | Yes, at the far south-east edge |

**9 of 12 have no contact with any planned road.** The remaining three have contact only with an unbuilt visual road strip, not a functional public road. Therefore **0 of 12 have demonstrated usable road access**.

### Graph result

The six visual strips have only four true rectangle intersections: west↔north, west↔south, east↔north, east↔south. The west-access and east-access strips **do not meet** the west/east collectors, leaving **three connected components**: one four-road rectangular perimeter and two isolated access strips. This does not mean that any of these are connected to the existing traffic engine.

### Important geometry finding

The source defines `RAIL_Z = 7*46 - 3.5*46 - 29 = 132`, while the row-7 east–west street centreline is `7*46 - 3.5*46 + 16 = 177`; the row-6 street centreline is **131**. The railway is thus only 1m away from the row-6 street. This is a critical visual/safety conflict requiring detailed collision and track alignment review. Earlier descriptions of this as a road/rail crossing design are too generous; parallel overlapping road and railway envelopes cannot be deemed safe by inspection of a single scalar coordinate.

### Plan-quality implications

- The first expansion was **not a viable road-access plan**. Freeze buildable/addressable flags until actual frontages and connected route graphs exist.
- The simplest fix (stretch all roads until they touch all parcels) may increase road length and infrastructure costs, and is not necessarily the best design.
- Compare at least three redesigned alternatives on *actual graph connectivity, walking distance, buffers, service costs and rail separation*, rather than scores alone.
- Current nominal zoning categories are narrative tags, not an LEP map or permission.
- The rectangles' combined area is 211,250m² (21.125ha), including 73,920m² of RU-tagged parcels. These are **not** twelve individual house lots.
- No traffic count, flood mapping, topography, engineering drawings or live browser measurements have been established.

## Reproduction snippet

```python
def gap(a,b):
    # a and b are tuples (name,x,z,width,depth)
    _,x,z,w,d=a
    _,X,Z,W,D=b
    return (max(0,abs(x-X)-(w+W)/2),
            max(0,abs(z-Z)-(d+D)/2))
# Contact only if both returned components are zero.
```

## External design controls checked

- Dubbo Council DCP page (last edited 4 Aug 2026): https://www.dubbo.nsw.gov.au/Builders-Developers/Planning-Controls-Tools-and-Resources/development-control-plan . Dubbo DCP 2013 remains listed, alongside precinct-specific DCPs and a 2025 north-west urban release residential DCP. **Site-specific DCP applicability not established.**
- Dubbo DCP consolidated PDF (adopted 1 May 2023): https://www.dubbo.nsw.gov.au/ArticleDocuments/354/Dubbo%20DCP2013%20-%20Adopted%20on%2001%2005%202023.pdf.aspx . Its contents identify industrial subdivision road hierarchy, stormwater and lot orientation (sections 2.3.4, pp 160–171) and rural development/subdivision (section 2.4); detailed numerical controls remain to be extracted and applied.
- Dubbo Council engineering standards page (last edited 8 Apr 2026): https://www.dubbo.nsw.gov.au/Builders-Developers/Planning-Controls-Tools-and-Resources/engineering-standards-drawings . Council says detailed engineering standards require a DRC&ME request. Listed standard drawings include footpaths/cycleways 5251, residential subdivision services 5268, intersection median 5458, street-name signs 6882 and rural driveway 7246. **Unavailable requested standards must not be invented.**
- Dubbo Council planning strategies: https://www.dubbo.nsw.gov.au/Builders-Developers/Planning-Controls-Tools-and-Resources/planning-resource-documents . Includes Minore District Strategy, employment lands and urban release plans. Their precise maps and numerical controls were not yet applied.
- Austroads Part 4A, edition 4.0, published 26 June 2026: https://austroads.gov.au/publications/road-design/agrd04a . Covers unsignalised/signalised intersection sight distances, turning, islands and property entrances.
- Austroads Part 4B, edition 3.3, published 12 August 2025: https://austroads.gov.au/publications/road-design/agrd04b . Roundabout design including pedestrian/cyclist treatments.
- NSW 2024 Address Policy: https://www.spatial.nsw.gov.au/__data/assets/pdf_file/0005/232808/NSW_Address_Policy_and_User_Manual_2024.pdf . Address numbering, urban/rural numbering, road naming and road types.
- NSW Government official addressing: https://www.nsw.gov.au/about-nsw/place-naming/addresses . Number + road + locality; local authority approval.
