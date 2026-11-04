# Narromine — evidence audit of modelled rail-crossing controls

Date: 4 November 2026. **Status: PARTIAL**. An OSM road/rail geometric intersection proves a possible crossing location, **not** that the actual crossing has half-boom barriers. `src/world/narromine-trains.js` currently uses `findCrossings()` to assign identical two-boom models to seven intersections. No crossing was modified in this feature branch.

## Primary-source verified historical identities

The ARTC `OGW-30-24` Network Information Book version 1.3 **dated 24 July 2018**, page 10, expressly distinguishes:

| ID | Road and railway segment | km | 2018 control |
|---|---|---:|---|
| 717 | Dandaloo **Street**, Main West | 497.629 | **Half-boom flashing lights** |
| 716 | Manildra Street, Main West | 496.784 | **Primary flashing lights** (not half-booms) |
| 1106 | Tullamore Road, Parkes–Narromine | 552.956 | **Primary flashing lights** |
| 1107 | Wingfield Road, Parkes–Narromine | 554.548 | **Stop signs** |
| 1108 | Backwater Road, Parkes–Narromine | 555.456 | **Stop signs** |
| 1109 | Dandaloo **Road**, Parkes–Narromine | 556.093 | **Stop signs** |
| 1867 | Dandaloo Road, Parkes–Narromine | 556.108 | **Stop signs** |

Source: https://www.artc.com.au/uploads/OGW-30-24_Book.pdf (historic 2018 copy, **NOT current operational authority**).

A 2024 ARTC operational notice separately confirms the **Dandaloo Street** crossing at km 497.629, LX ID 059, and a pedestrian crossing at km 497.651; it does not itself certify the present boom configuration: https://www.purerail.com.au/wp-content/uploads/2024/05/2-5550-Temporary-Closure-of-Dandaloo-Street-Level-Crossings-497.629km.pdf

NSW Government confirms an LED augmented-stop-sign trial at **Dandaloo Road LX1109** beginning in 2023, not a half-boom retrofit: https://www.nsw.gov.au/business-and-economy/smart-places/case-studies/level-crossing-safety-technology-trial

Narromine Shire Council in July 2024 reported work on the Dandaloo Street **pedestrian crossing**: https://www.narromine.nsw.gov.au/__media_downloads/council_column/2024.07.24%20Council%20Column.pdf?downloadable=1

## Remaining work — no fabricated precision

1. Compute the seven `findCrossings()` results (road name + WGS84 coordinate + line way) and reconcile **each** against the latest ARTC NIB `OGW-30-23`, ALCAM/NSW TfNSW crossing IDs, newer imagery and changes since 2018. https://www.artc.com.au/customers/operations/nib/
2. Replace identical boom infrastructure **only at locations verified to have it**. For flashing-light-only or passive crossings, model the correct distinct warning equipment and behaviour, including not suddenly obstructing road users.
3. Separately model pedestrian crossing provision at Dandaloo Street from evidence. Train speed limits and real service times remain *unverified gameplay assumptions*, not ARTC-confirmed.
4. Real browser verification: location, vehicle/pedestrian crossing logic, no z-fighting, clearance, slow-phone performance and hosted commit SHA.

These are historical evidence categories. **Do not infer that the 2018 configuration is still current on 4 Nov 2026.**
