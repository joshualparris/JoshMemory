"""Sample each traced building's roof colour from NSW Spatial Services aerial imagery.

Writes src/world/narromine-roof-colours-data.js: {"x,z": 0xRRGGBB} for the Microsoft footprints in
narromine-footprints-data.js, keyed like NARROMINE_FOOTPRINT_LIDAR. Imagery: NSW Spatial Services
NSW_Imagery MapServer (CC BY 4.0), fetched at 0.25 m/px in 400 m tiles and cached outside the repo.

Per footprint: the median colour of pixels in the inner 60% of the outline (the edges blur into
gutters, walls and ground, and low roofs lean up to about a metre in the photo). Shadow (dark) and
tree (green-dominant) pixels are dropped; under 35% usable pixels leaves the roof unsampled.

usage: python tools/narromine_roof_colours.py <cache dir>   (needs numpy, pillow, pyproj)
"""
import io, json, math, os, re, sys, time, urllib.request
import numpy as np
from PIL import Image
from pyproj import Transformer

HERE = os.path.dirname(os.path.abspath(__file__))
WORLD = os.path.join(HERE, '..', 'src', 'world')
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', '.cache', 'nsw-imagery')
os.makedirs(CACHE, exist_ok=True)
EXPORT = ('https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Imagery/MapServer/export'
          '?bbox={x0},{y0},{x1},{y1}&bboxSR=7855&imageSR=7855&size={n},{n}&format=png&f=image')
TILE, RES = 400.0, 0.25          # metres per tile, metres per pixel

def js_json(path, name):
    src = open(path, encoding='utf8').read()
    m = re.search(r'export const ' + name + r'\s*=\s*', src)
    return json.JSONDecoder().raw_decode(src[m.end():])[0]

footprints = js_json(os.path.join(WORLD, 'narromine-footprints-data.js'), 'NARROMINE_FOOTPRINTS')
osm = js_json(os.path.join(WORLD, 'narromine-osm-data.js'), 'NARROMINE_OSM')
layout = open(os.path.join(WORLD, 'narromine-layout.js'), encoding='utf8').read()
X0 = float(re.search(r"x0: (-?[\d.]+), x1: -?[\d.]+, z: HIGHWAY_Z", layout).group(1))
Z0 = float(re.search(r"export const HIGHWAY_Z = (-?[\d.]+)", layout).group(1))
RAD, EARTH = math.pi / 180, 6371008.8
lat0, lon0 = osm['anchor']['lat'], osm['anchor']['lon']
COS = math.cos(lat0 * RAD)
to_mga = Transformer.from_crs(4326, 7855, always_xy=True)

def world_to_mga(x, z):
    lon = lon0 + (x - X0) / (RAD * EARTH * COS)
    lat = lat0 - (z - Z0) / (RAD * EARTH)
    return to_mga.transform(lon, lat)

def outline(x, z, w, d, yaw, scale=1.0):
    # Same corner convention as footprint() in narromine-layout.js.
    c, s = math.cos(yaw), math.sin(yaw)
    return [(x + a * c * w / 2 * scale + b * s * d / 2 * scale, z - a * s * w / 2 * scale + b * c * d / 2 * scale)
            for a, b in ((-1, -1), (1, -1), (1, 1), (-1, 1))]

tiles = {}
def tile(tx, ty):
    if (tx, ty) in tiles: return tiles[(tx, ty)]
    path = os.path.join(CACHE, f'{tx}_{ty}.png')
    if not os.path.exists(path):
        x0, y0 = tx * TILE, ty * TILE
        url = EXPORT.format(x0=x0, y0=y0, x1=x0 + TILE, y1=y0 + TILE, n=int(TILE / RES))
        for attempt in range(4):
            try:
                data = urllib.request.urlopen(url, timeout=60).read(); break
            except Exception:
                time.sleep(2 + attempt * 3)
        else: raise SystemExit('imagery fetch failed: ' + url)
        open(path, 'wb').write(data)
    tiles[(tx, ty)] = np.asarray(Image.open(path).convert('RGB'))
    return tiles[(tx, ty)]

def pixels(poly_mga):
    xs, ys = [p[0] for p in poly_mga], [p[1] for p in poly_mga]
    out = []
    for e in np.arange(min(xs), max(xs), RES):
        for n in np.arange(min(ys), max(ys), RES):
            inside = False
            for i in range(4):
                (ax, ay), (bx, by) = poly_mga[i - 1], poly_mga[i]
                if (by > n) != (ay > n) and e < (ax - bx) * (n - by) / (ay - by) + bx: inside = not inside
            if not inside: continue
            tx, ty = int(e // TILE), int(n // TILE)
            img = tile(tx, ty)
            col, row = int((e - tx * TILE) / RES), int((ty * TILE + TILE - n) / RES)
            if 0 <= row < img.shape[0] and 0 <= col < img.shape[1]: out.append(img[row, col])
    return np.array(out, dtype=float)

colours, skipped = {}, 0
for i, (x, z, w, d, yaw, _h) in enumerate(footprints):
    px = pixels([world_to_mga(*p) for p in outline(x, z, w, d, yaw, 0.6)])
    if len(px) < 8: skipped += 1; continue
    r, g, b = px[:, 0], px[:, 1], px[:, 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    ok = (lum > 45) & ~((g > r + 8) & (g > b + 20))   # foliage: blue well below green; green Colorbond keeps blue near green
    if ok.mean() < 0.35: skipped += 1; continue
    m = np.median(px[ok], axis=0).round().astype(int)
    colours[f'{x:.1f},{z:.1f}'] = int(m[0]) << 16 | int(m[1]) << 8 | int(m[2])
    if i % 250 == 0: print(f'{i}/{len(footprints)} sampled, {len(tiles)} tiles', file=sys.stderr)

# Town geometry is batched one mesh per colour per tile, so ~2,300 distinct colours would mean
# thousands of draw calls. Cluster into a palette of PALETTE real roof colours (deterministic k-means,
# seeded at luminance quantiles) and store each roof as its cluster colour.
PALETTE = 24
keys = list(colours); arr = np.array([[v >> 16, v >> 8 & 255, v & 255] for v in colours.values()], dtype=float)
lum = arr @ [0.299, 0.587, 0.114]
centres = arr[np.argsort(lum)[np.linspace(0, len(arr) - 1, PALETTE).astype(int)]].copy()
for _ in range(40):
    lab = np.argmin(((arr[:, None, :] - centres[None]) ** 2).sum(-1), axis=1)
    for k in range(PALETTE):
        if (lab == k).any(): centres[k] = arr[lab == k].mean(0)
err = np.sqrt(((arr - centres[lab]) ** 2).sum(-1))
print(f'palette {PALETTE}: median colour error {np.median(err):.1f}, p95 {np.percentile(err, 95):.1f} (0-255 RGB)', file=sys.stderr)
c8 = centres.round().astype(int)
colours = {k: int(c8[l][0]) << 16 | int(c8[l][1]) << 8 | int(c8[l][2]) for k, l in zip(keys, lab)}
body = ','.join(f'"{k}":0x{v:06x}' for k, v in sorted(colours.items()))
open(os.path.join(WORLD, 'narromine-roof-colours-data.js'), 'w', encoding='utf8').write(
    '// Generated by tools/narromine_roof_colours.py — do not edit.\n'
    '// Roof colours sampled from NSW Spatial Services aerial imagery (NSW_Imagery MapServer, 0.25 m/px),\n'
    '// © State of New South Wales (Spatial Services), CC BY 4.0. Median of the inner 60% of each Microsoft\n'
    '// footprint outline, shadow and tree pixels dropped, then clustered into a 24-colour palette of\n'
    '// real roof colours (k-means) so the town stays batched. Keyed "x,z" like NARROMINE_FOOTPRINT_LIDAR.\n'
    f'// {len(colours)} of {len(footprints)} footprints sampled; {skipped} unreadable (shade, trees or off-image).\n'
    'export const NARROMINE_ROOF_COLOURS = {' + body + '};\n')
print(f'{len(colours)} roof colours, {skipped} unreadable, {len(tiles)} imagery tiles', file=sys.stderr)
