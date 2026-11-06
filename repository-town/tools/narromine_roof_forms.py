"""Classify each traced building's roof form from NSW Spatial Services 2023 airborne LiDAR (CC BY 4.0).

Writes src/world/narromine-roof-forms-data.js: {"x,z": "form"} for Microsoft footprints inside the
2023 tiles, keyed like NARROMINE_FOOTPRINT_LIDAR. Forms, in the footprint's own frame (w axis =
first edge, d axis = second, as in narromine-layout.js footprint()):
  "flat"            rise (ridge p98 - eave p5 of class-6 points) under 0.6 m
  "skillion+w" etc. heights rise steadily across one axis (|correlation| > 0.85), high side given
  "gable-w"/"-d"    along the ridge line, points at the ends stay above 70% of the rise
  "hip-w"/"-d"      ...or fall below 40% of it (the ends slope down); in between: unclassified
The ridge axis is the one along which the top quarter of the rise (the ridge band) spreads furthest. Under 2 building points per m2 (survey is ~4):
not classified (the renderer keeps its default roof); under 0.5/m2 is listed as a likely missing building.

usage: python tools/narromine_roof_forms.py tile1.laz [tile2.laz ...]   (needs numpy, laspy[lazrs], pyproj)
"""
import json, math, os, re, sys
import laspy, numpy as np
from pyproj import Transformer

HERE = os.path.dirname(os.path.abspath(__file__))
WORLD = os.path.join(HERE, '..', 'src', 'world')
def js_json(path, name):
    src = open(path, encoding='utf8').read(); m = re.search(r'export const ' + name + r'\s*=\s*', src)
    return json.JSONDecoder().raw_decode(src[m.end():])[0]
footprints = js_json(os.path.join(WORLD, 'narromine-footprints-data.js'), 'NARROMINE_FOOTPRINTS')
osm = js_json(os.path.join(WORLD, 'narromine-osm-data.js'), 'NARROMINE_OSM')
layout = open(os.path.join(WORLD, 'narromine-layout.js'), encoding='utf8').read()
X0 = float(re.search(r"x0: (-?[\d.]+), x1: -?[\d.]+, z: HIGHWAY_Z", layout).group(1))
Z0 = float(re.search(r"export const HIGHWAY_Z = (-?[\d.]+)", layout).group(1))
RAD, EARTH = math.pi / 180, 6371008.8
lat0, lon0 = osm['anchor']['lat'], osm['anchor']['lon']; COS = math.cos(lat0 * RAD)
to_mga = Transformer.from_crs(4326, 7855, always_xy=True)
def world_to_mga(x, z):
    return to_mga.transform(lon0 + (x - X0) / (RAD * EARTH * COS), lat0 - (z - Z0) / (RAD * EARTH))

xs, ys, zs, cs = [], [], [], []
for p in sys.argv[1:]:
    f = laspy.read(p); c = np.asarray(f.classification); k = (c == 6) | (c == 2)
    xs.append(np.asarray(f.x)[k]); ys.append(np.asarray(f.y)[k]); zs.append(np.asarray(f.z)[k]); cs.append(c[k])
X, Y, Z, C = map(np.concatenate, (xs, ys, zs, cs))
bx0, bx1, by0, by1 = X.min(), X.max(), Y.min(), Y.max()
# 10 m grid index so each footprint only looks at nearby points.
gi = ((X - bx0) // 10).astype(np.int64) * 100000 + ((Y - by0) // 10).astype(np.int64)
order = np.argsort(gi); gi_sorted = gi[order]

def near(e0, e1, n0, n1):
    out = []
    for gx in range(int((e0 - bx0) // 10), int((e1 - bx0) // 10) + 1):
        a = np.searchsorted(gi_sorted, gx * 100000 + int((n0 - by0) // 10)); b = np.searchsorted(gi_sorted, gx * 100000 + int((n1 - by0) // 10) + 1)
        out.append(order[a:b])
    return np.concatenate(out) if out else np.array([], int)

forms, counts, empty = {}, {}, []
for x, z, w, d, yaw, _h in footprints:
    cx, cy = world_to_mga(x, z)
    if not (bx0 + 15 < cx < bx1 - 15 and by0 + 15 < cy < by1 - 15): continue
    # Footprint axes in MGA: the game's w axis is (cos yaw, -sin yaw) in (x, z); z points south = -north.
    ue = np.array(world_to_mga(x + math.cos(yaw), z - math.sin(yaw))) - (cx, cy)
    ve = np.array(world_to_mga(x + math.sin(yaw), z + math.cos(yaw))) - (cx, cy)
    ue /= np.linalg.norm(ue); ve /= np.linalg.norm(ve)
    r = math.hypot(w, d) / 2 + 9
    idx = near(cx - r, cx + r, cy - r, cy + r)
    if not len(idx): continue
    dx, dy = X[idx] - cx, Y[idx] - cy
    u, v = dx * ue[0] + dy * ue[1], dx * ve[0] + dy * ve[1]
    inside = (np.abs(u) < w / 2 * 0.92) & (np.abs(v) < d / 2 * 0.92)
    roof = inside & (C[idx] == 6)
    ground = (C[idx] == 2) & ~((np.abs(u) < w / 2 + 1) & (np.abs(v) < d / 2 + 1))
    if ground.sum() < 10: continue
    # The survey is ~4 pts/m2. Under 2 building points per m2 inside the outline means no solid roof was
    # there in 2023 (an empty yard, trees or a carport): leave it unclassified and list it for review.
    if roof.sum() < max(40, 2.0 * w * d * 0.92 * 0.92):
        if roof.sum() < 0.5 * w * d * 0.92 * 0.92: empty.append(f'{x:.1f},{z:.1f}')
        continue
    h = Z[idx][roof] - np.median(Z[idx][ground]); ru, rv = u[roof], v[roof]
    eave, ridge = np.percentile(h, 5), np.percentile(h, 98); rise = ridge - eave
    key = f'{x:.1f},{z:.1f}'
    if rise < 0.6: form = 'flat'
    else:
        cu, cv = np.corrcoef(ru, h)[0, 1], np.corrcoef(rv, h)[0, 1]
        band = h >= ridge - 0.25 * rise
        # Skillion: height rises steadily across one axis AND the highest band sits at that axis's edge
        # (a hipped house with a low verandah on one side also correlates, but its ridge is central).
        ax_u = abs(cu) >= abs(cv); coord, length, cr = (ru, w, cu) if ax_u else (rv, d, cv)
        if abs(cr) > 0.85 and band.sum() > 4 and np.sign(cr) * np.median(coord[band]) > 0.3 * length:
            form = ('skillion+' if cr > 0 else 'skillion-') + ('w' if ax_u else 'd')
        else:
            su = (np.percentile(ru[band], 95) - np.percentile(ru[band], 5)) if band.sum() > 4 else 0
            sv = (np.percentile(rv[band], 95) - np.percentile(rv[band], 5)) if band.sum() > 4 else 0
            axis, along, across, length, width = ('w', ru, rv, w, d) if su >= sv else ('d', rv, ru, d, w)
            # Along the ridge line, a gable's end points stay near ridge height; a hip's fall to the eave.
            ends = (np.abs(across) < 0.15 * width) & (np.abs(along) > 0.36 * length)
            if ends.sum() < 6: continue
            e = (np.median(h[ends]) - eave) / rise
            if e > 0.7: form = 'gable-' + axis
            elif e < 0.4: form = 'hip-' + axis
            else: continue   # ambiguous: leave unclassified
    forms[key] = form; base = form.split('-')[0].split('+')[0]; counts[base] = counts.get(base, 0) + 1

body = ','.join(f'"{k}":"{v}"' for k, v in sorted(forms.items()))
open(os.path.join(WORLD, 'narromine-roof-forms-data.js'), 'w', encoding='utf8').write(
    '// Generated by tools/narromine_roof_forms.py — do not edit.\n'
    '// Roof form of each Microsoft footprint inside the 2023 NSW Spatial Services airborne LiDAR tiles\n'
    '// (MacquarieFloodplainSouth 2023, CC BY 4.0), from its building-class points: flat, skillion (+/- high\n'
    '// side along w or d), gable or hip with the ridge along w or d. Keyed "x,z" like NARROMINE_FOOTPRINT_LIDAR.\n'
    f'// {len(forms)} classified: ' + ', '.join(f'{k} {v}' for k, v in sorted(counts.items())) + '.\n'
    'export const NARROMINE_ROOF_FORMS = {' + body + '};\n'
    '// Footprints inside the tiles with almost no building points (< 0.5/m2): likely no building in 2023. For review only.\n'
    'export const NARROMINE_FOOTPRINTS_WITHOUT_LIDAR_ROOF = ' + json.dumps(sorted(empty)) + ';\n')
print(len(forms), counts, 'no-roof', len(empty), file=sys.stderr)
