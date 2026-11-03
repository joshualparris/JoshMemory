"""Measure Narromine building heights from NSW Spatial Services airborne LiDAR (CC BY 4.0).

Inputs : LAZ tiles (MacquarieFloodplainSouth 2023, 4 pts/m^2, GDA2020 MGA55 + AHD; Narromine 2011,
         GDA94 MGA55) and a targets JSON of building polygons in lat/lon (tools export).
Method : for each polygon, take the surveyor-classified building points (class 6) inside it and the
         bare-ground points (class 2) within 8 m around it. Ground = median ground elevation. Heights
         above ground: eave = 5th percentile, ridge = 98th percentile, typical = median. Points per m^2
         inside the footprint is reported so thin coverage is visible. The 2023 survey is used where
         it covers the polygon; otherwise the 2011 survey.
Output : JSON {key: {src, ground, eave, ridge, median, n, density}} (metres, 2 dp).
Run    : python3 tools/narromine_lidar.py targets.json out.json tile1.laz [tile2.laz ...]
"""
import json, sys
import laspy, numpy as np
from pyproj import Transformer
targets, out_path, tiles = json.load(open(sys.argv[1])), sys.argv[2], sys.argv[3:]
surveys = []
for p in tiles:
    f = laspy.read(p); crs = f.header.parse_crs(); epsg = 7855 if 'GDA2020' in crs.name else 28355
    cls = np.asarray(f.classification); keep = (cls == 6) | (cls == 2)
    surveys.append({'name': p.split('/')[-1], 'year': 2023 if epsg == 7855 else 2011, 'epsg': epsg,  # 2023 survey is GDA2020, 2011 is GDA94
        'x': np.asarray(f.x)[keep], 'y': np.asarray(f.y)[keep], 'z': np.asarray(f.z)[keep], 'c': cls[keep],
        'bounds': (f.header.mins[0], f.header.mins[1], f.header.maxs[0], f.header.maxs[1])})
tf = {e: Transformer.from_crs(4326, e, always_xy=True) for e in (7855, 28355)}
def inside(px, py, poly):
    c = np.zeros(px.shape, bool); n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]; x2, y2 = poly[i - 1]
        m = ((y1 > py) != (y2 > py)) & (px < (x2 - x1) * (py - y1) / ((y2 - y1) or 1e-12) + x1); c ^= m
    return c
def area(poly): return abs(sum(poly[i][0] * poly[i - 1][1] - poly[i - 1][0] * poly[i][1] for i in range(len(poly)))) / 2
res = {}
for t in targets['osm'] + targets['parts']:
    best = None
    for s in sorted(surveys, key=lambda s: -s['year']):
        poly = [tf[s['epsg']].transform(lon, lat) for lat, lon in t['pts']]
        xs, ys = [p[0] for p in poly], [p[1] for p in poly]; b = s['bounds']
        if min(xs) < b[0] or max(xs) > b[2] or min(ys) < b[1] or max(ys) > b[3]: continue
        box = (s['x'] > min(xs) - 8) & (s['x'] < max(xs) + 8) & (s['y'] > min(ys) - 8) & (s['y'] < max(ys) + 8)
        x, y, z, c = s['x'][box], s['y'][box], s['z'][box], s['c'][box]
        ins = inside(x, y, poly); g = z[(c == 2) & ~ins]; bz = z[(c == 6) & ins]
        if len(g) < 10 or len(bz) < 8: continue
        ground = float(np.median(g)); h = bz - ground; a = area(poly)
        best = {'src': s['year'], 'ground': round(ground, 2), 'eave': round(float(np.percentile(h, 5)), 2), 'ridge': round(float(np.percentile(h, 98)), 2),
                'median': round(float(np.median(h)), 2), 'n': int(len(bz)), 'density': round(len(bz) / a, 2) if a else None}
        break
    if best: res[t['key']] = best
json.dump(res, open(out_path, 'w'), indent=0); print('measured', len(res), 'of', len(targets['osm']) + len(targets['parts']))
