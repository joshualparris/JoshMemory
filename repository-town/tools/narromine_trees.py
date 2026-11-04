"""Detect real trees in Narromine from NSW Spatial Services 2023 airborne LiDAR (CC BY 4.0).

Method: canopy height = highest high-vegetation point (class 5) per 1 m cell minus local ground
(class 2 median per 5 m cell). Tree tops are local maxima of the canopy height within a 3 m radius
that are at least 3.5 m tall. Each canopy cell taller than half its nearest top's height and within
9 m is assigned to that top; crown radius = sqrt(cells / pi). Outputs [lat, lon, height, crownRadius].
Run: python3 tools/narromine_trees.py out.json tile1.laz [tile2.laz ...]
"""
import json, sys
import laspy, numpy as np
from pyproj import Transformer
from scipy import ndimage
out_path, tiles = sys.argv[1], sys.argv[2:]
to_geo = Transformer.from_crs(7855, 4326, always_xy=True)
trees = []
for p in tiles:
    f = laspy.read(p); c = np.asarray(f.classification); x, y, z = np.asarray(f.x), np.asarray(f.y), np.asarray(f.z)
    x0, y0 = f.header.mins[0], f.header.mins[1]; W = int(np.ceil(f.header.maxs[0] - x0)); H = int(np.ceil(f.header.maxs[1] - y0))
    g = c == 2; gi = ((x[g] - x0) // 5).astype(int); gj = ((y[g] - y0) // 5).astype(int)
    ground = np.full((W // 5 + 1, H // 5 + 1), np.nan)
    order = np.lexsort((z[g], gj, gi)); key = gi[order] * 100000 + gj[order]; zs = z[g][order]
    uk, start, cnt = np.unique(key, return_index=True, return_counts=True)
    ground[uk // 100000, uk % 100000] = zs[start + cnt // 2]
    gf = ground.copy(); mask = np.isnan(gf)
    if mask.any():
        idx = ndimage.distance_transform_edt(mask, return_distances=False, return_indices=True); gf = gf[tuple(idx)]
    v = c == 5; vi = ((x[v] - x0) // 1).astype(int); vj = ((y[v] - y0) // 1).astype(int)
    hgt = z[v] - gf[np.minimum(vi // 5, gf.shape[0] - 1), np.minimum(vj // 5, gf.shape[1] - 1)]
    chm = np.zeros((W + 1, H + 1)); np.maximum.at(chm, (vi, vj), hgt)
    chm = ndimage.median_filter(chm, size=3)
    peaks = (chm == ndimage.maximum_filter(chm, footprint=np.hypot(*np.mgrid[-3:4, -3:4]) <= 3)) & (chm >= 3.5)
    pi, pj = np.nonzero(peaks)
    if not len(pi): continue
    lab = np.zeros(chm.shape, int); lab[pi, pj] = np.arange(1, len(pi) + 1)
    dist, (ni, nj) = ndimage.distance_transform_edt(lab == 0, return_indices=True)
    near = lab[ni, nj]; top = chm[pi, pj]
    crown = (chm > 0.5 * top[np.maximum(near - 1, 0)]) & (dist <= 9) & (near > 0)
    counts = np.bincount(near[crown], minlength=len(pi) + 1)[1:]
    for k in range(len(pi)):
        lon, lat = to_geo.transform(x0 + pi[k] + 0.5, y0 + pj[k] + 0.5)
        trees.append([round(lat, 7), round(lon, 7), round(float(top[k]), 1), round(float(np.sqrt(max(counts[k], 1) / np.pi)), 1)])
json.dump(trees, open(out_path, 'w')); print('trees', len(trees))
