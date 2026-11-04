// PNG analysis, daylight verification, and baseline comparison engine for Narromine Visual QA.
// Distinguishes genuine rendering regressions from expected differences caused by time, weather, or lighting.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/**
 * Decodes an 8-bit RGB (colorType 2) or RGBA (colorType 6) PNG buffer into { width, height, rgba }.
 */
export function decodePng(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 33) {
    throw new Error('Invalid PNG buffer: too short');
  }
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Invalid PNG signature');
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idatChunks = [];

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > buffer.length) break;

    if (type === 'IHDR') {
      width = buffer.readUInt32BE(dataStart);
      height = buffer.readUInt32BE(dataStart + 4);
      bitDepth = buffer[dataStart + 8];
      colorType = buffer[dataStart + 9];
      interlace = buffer[dataStart + 12];
    } else if (type === 'IDAT') {
      idatChunks.push(buffer.subarray(dataStart, dataEnd));
    } else if (type === 'IEND') {
      break;
    }
    offset = dataEnd + 4;
  }

  if (!width || !height) {
    throw new Error('PNG missing valid IHDR dimensions');
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6) || interlace !== 0) {
    throw new Error(
      `Unsupported PNG format: bitDepth=${bitDepth}, colorType=${colorType}, interlace=${interlace}`
    );
  }

  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const expectedLen = height * (stride + 1);
  if (raw.length < expectedLen) {
    throw new Error(`Truncated PNG IDAT stream: got ${raw.length}, expected ${expectedLen}`);
  }

  const unfilter = new Uint8Array(height * stride);
  for (let y = 0; y < height; y++) {
    const filterType = raw[y * (stride + 1)];
    const rowIn = y * (stride + 1) + 1;
    const rowOut = y * stride;
    const prevOut = (y - 1) * stride;

    for (let i = 0; i < stride; i++) {
      const x = raw[rowIn + i];
      const a = i >= channels ? unfilter[rowOut + i - channels] : 0;
      const b = y > 0 ? unfilter[prevOut + i] : 0;
      const c = y > 0 && i >= channels ? unfilter[prevOut + i - channels] : 0;

      let val = x;
      if (filterType === 1) val = (x + a) & 0xff;
      else if (filterType === 2) val = (x + b) & 0xff;
      else if (filterType === 3) val = (x + ((a + b) >> 1)) & 0xff;
      else if (filterType === 4) val = (x + paethPredictor(a, b, c)) & 0xff;
      unfilter[rowOut + i] = val;
    }
  }

  if (channels === 4) {
    return { width, height, rgba: unfilter };
  }

  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0, j = 0; i < unfilter.length; i += 3, j += 4) {
    rgba[j] = unfilter[i];
    rgba[j + 1] = unfilter[i + 1];
    rgba[j + 2] = unfilter[i + 2];
    rgba[j + 3] = 255;
  }
  return { width, height, rgba };
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/**
 * Encodes { width, height, rgba } into a valid 8-bit RGBA PNG Buffer.
 */
export function encodePng({ width, height, rgba }) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type 0 (None)
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1
    );
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth 8
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([
    PNG_SIGNATURE,
    makePngChunk('IHDR', ihdr),
    makePngChunk('IDAT', idat),
    makePngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Downsamples an image to a fixed grid (default 64×40) of luma and Sobel gradient magnitudes
 * for fast, deterministic structural vs lighting comparison.
 */
export function computeStructuralSignature({ width, height, rgba }, gridW = 64, gridH = 40) {
  const lumaGrid = new Float32Array(gridW * gridH);
  const rGrid = new Float32Array(gridW * gridH);
  const gGrid = new Float32Array(gridW * gridH);
  const bGrid = new Float32Array(gridW * gridH);

  for (let gy = 0; gy < gridH; gy++) {
    const y0 = Math.floor((gy * height) / gridH);
    const y1 = Math.max(y0 + 1, Math.floor(((gy + 1) * height) / gridH));
    for (let gx = 0; gx < gridW; gx++) {
      const x0 = Math.floor((gx * width) / gridW);
      const x1 = Math.max(x0 + 1, Math.floor(((gx + 1) * width) / gridW));
      let sr = 0,
        sg = 0,
        sb = 0,
        count = 0;
      const stepY = Math.max(1, Math.floor((y1 - y0) / 4));
      const stepX = Math.max(1, Math.floor((x1 - x0) / 4));
      for (let y = y0; y < y1; y += stepY) {
        for (let x = x0; x < x1; x += stepX) {
          const idx = (y * width + x) * 4;
          sr += rgba[idx];
          sg += rgba[idx + 1];
          sb += rgba[idx + 2];
          count++;
        }
      }
      const k = gy * gridW + gx;
      rGrid[k] = sr / count;
      gGrid[k] = sg / count;
      bGrid[k] = sb / count;
      lumaGrid[k] = 0.2126 * rGrid[k] + 0.7152 * gGrid[k] + 0.0722 * bGrid[k];
    }
  }

  const edgeGrid = new Float32Array(gridW * gridH);
  let edgeSum = 0;
  let strongEdges = 0;
  for (let gy = 1; gy < gridH - 1; gy++) {
    for (let gx = 1; gx < gridW - 1; gx++) {
      const tl = lumaGrid[(gy - 1) * gridW + (gx - 1)];
      const tc = lumaGrid[(gy - 1) * gridW + gx];
      const tr = lumaGrid[(gy - 1) * gridW + (gx + 1)];
      const ml = lumaGrid[gy * gridW + (gx - 1)];
      const mr = lumaGrid[gy * gridW + (gx + 1)];
      const bl = lumaGrid[(gy + 1) * gridW + (gx - 1)];
      const bc = lumaGrid[(gy + 1) * gridW + gx];
      const br = lumaGrid[(gy + 1) * gridW + (gx + 1)];

      const gxVal = -tl + tr - 2 * ml + 2 * mr - bl + br;
      const gyVal = -tl - 2 * tc - tr + bl + 2 * bc + br;
      const mag = Math.min(255, Math.hypot(gxVal, gyVal) / 4);
      edgeGrid[gy * gridW + gx] = mag;
      edgeSum += mag;
      if (mag > 12) strongEdges++;
    }
  }

  const innerCount = Math.max(1, (gridW - 2) * (gridH - 2));
  return {
    gridW,
    gridH,
    lumaGrid,
    rGrid,
    gGrid,
    bGrid,
    edgeGrid,
    edgeMean: Number((edgeSum / innerCount).toFixed(2)),
    edgeDensity: Number((strongEdges / innerCount).toFixed(4)),
  };
}

/**
 * Analyzes a PNG buffer and returns dimensions, colour/luminance stats, band summaries,
 * and blank/missing-geometry indicators.
 */
export function analyzePngBuffer(buffer) {
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const decoded = decodePng(buffer);
  const { width, height, rgba } = decoded;

  let sumR = 0,
    sumG = 0,
    sumB = 0;
  let sumLuma = 0,
    sumLumaSq = 0;
  let skyR = 0,
    skyG = 0,
    skyB = 0,
    skyLuma = 0,
    skyCount = 0;
  let midLuma = 0,
    midLumaSq = 0,
    midCount = 0;
  let groundR = 0,
    groundG = 0,
    groundB = 0,
    groundLuma = 0,
    groundCount = 0;

  const skyYEnd = Math.floor(height * 0.3);
  const midYEnd = Math.floor(height * 0.72);
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 40000)));

  let samples = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const r = rgba[idx];
      const g = rgba[idx + 1];
      const b = rgba[idx + 2];
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      sumR += r;
      sumG += g;
      sumB += b;
      sumLuma += luma;
      sumLumaSq += luma * luma;
      samples++;

      if (y < skyYEnd) {
        skyR += r;
        skyG += g;
        skyB += b;
        skyLuma += luma;
        skyCount++;
      } else if (y < midYEnd) {
        midLuma += luma;
        midLumaSq += luma * luma;
        midCount++;
      } else {
        groundR += r;
        groundG += g;
        groundB += b;
        groundLuma += luma;
        groundCount++;
      }
    }
  }

  const lumaMean = sumLuma / Math.max(1, samples);
  const lumaVariance = Math.max(0, sumLumaSq / Math.max(1, samples) - lumaMean * lumaMean);
  const lumaStdDev = Math.sqrt(lumaVariance);

  const midMean = midLuma / Math.max(1, midCount);
  const midStdDev = Math.sqrt(
    Math.max(0, midLumaSq / Math.max(1, midCount) - midMean * midMean)
  );

  const sig = computeStructuralSignature(decoded);
  const isBlankOrFlat = lumaStdDev < 4.5 || midStdDev < 3.5 || sig.edgeDensity < 0.015;

  return {
    width,
    height,
    byteSize: buffer.length,
    sha256,
    meanRgb: [
      Number((sumR / Math.max(1, samples)).toFixed(1)),
      Number((sumG / Math.max(1, samples)).toFixed(1)),
      Number((sumB / Math.max(1, samples)).toFixed(1)),
    ],
    lumaMean: Number(lumaMean.toFixed(2)),
    lumaStdDev: Number(lumaStdDev.toFixed(2)),
    skyBand: {
      meanRgb: [
        Number((skyR / Math.max(1, skyCount)).toFixed(1)),
        Number((skyG / Math.max(1, skyCount)).toFixed(1)),
        Number((skyB / Math.max(1, skyCount)).toFixed(1)),
      ],
      lumaMean: Number((skyLuma / Math.max(1, skyCount)).toFixed(2)),
    },
    horizonBand: {
      lumaMean: Number(midMean.toFixed(2)),
      lumaStdDev: Number(midStdDev.toFixed(2)),
      edgeMean: sig.edgeMean,
      edgeDensity: sig.edgeDensity,
    },
    groundBand: {
      meanRgb: [
        Number((groundR / Math.max(1, groundCount)).toFixed(1)),
        Number((groundG / Math.max(1, groundCount)).toFixed(1)),
        Number((groundB / Math.max(1, groundCount)).toFixed(1)),
      ],
      lumaMean: Number((groundLuma / Math.max(1, groundCount)).toFixed(2)),
    },
    isBlankOrFlat,
    _signature: sig,
  };
}

/**
 * Verifies that morning, midday, and late-afternoon captures for the same location + viewport
 * exhibit measurable daylight/shadow differences (confirming clock & sun updates work visually).
 */
export function verifyDaylightProgression(capturesForLocationViewport) {
  const byLighting = new Map(capturesForLocationViewport.map((c) => [c.lighting, c]));
  const morning = byLighting.get('morning');
  const midday = byLighting.get('midday');
  const afternoon = byLighting.get('late-afternoon');

  if (!morning || !midday || !afternoon) {
    return {
      complete: false,
      visibleDifference: false,
      reason: 'Missing one or more daylight presets (morning, midday, late-afternoon)',
    };
  }

  const hashesDistinct =
    morning.image.sha256 !== midday.image.sha256 &&
    midday.image.sha256 !== afternoon.image.sha256 &&
    morning.image.sha256 !== afternoon.image.sha256;

  const sunDeltaMorningMidday = Math.hypot(
    (morning.solar?.sunlight?.x ?? 0) - (midday.solar?.sunlight?.x ?? 0),
    (morning.solar?.sunlight?.y ?? 0) - (midday.solar?.sunlight?.y ?? 0),
    (morning.solar?.sunlight?.z ?? 0) - (midday.solar?.sunlight?.z ?? 0)
  );
  const sunDeltaMiddayAfternoon = Math.hypot(
    (midday.solar?.sunlight?.x ?? 0) - (afternoon.solar?.sunlight?.x ?? 0),
    (midday.solar?.sunlight?.y ?? 0) - (afternoon.solar?.sunlight?.y ?? 0),
    (midday.solar?.sunlight?.z ?? 0) - (afternoon.solar?.sunlight?.z ?? 0)
  );

  const lumaSpan =
    Math.max(morning.image.lumaMean, midday.image.lumaMean, afternoon.image.lumaMean) -
    Math.min(morning.image.lumaMean, midday.image.lumaMean, afternoon.image.lumaMean);

  const rgbDistance = (a, b) =>
    Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const maxMeanRgbDelta = Math.max(
    rgbDistance(morning.image.meanRgb, midday.image.meanRgb),
    rgbDistance(midday.image.meanRgb, afternoon.image.meanRgb),
    rgbDistance(morning.image.meanRgb, afternoon.image.meanRgb)
  );

  const visibleDifference =
    hashesDistinct && (lumaSpan >= 0.4 || maxMeanRgbDelta >= 0.6 || sunDeltaMorningMidday > 5);

  return {
    complete: true,
    visibleDifference,
    hashesDistinct,
    lumaSpan: Number(lumaSpan.toFixed(2)),
    maxMeanRgbDelta: Number(maxMeanRgbDelta.toFixed(2)),
    sunDeltaMorningMidday: Number(sunDeltaMorningMidday.toFixed(2)),
    sunDeltaMiddayAfternoon: Number(sunDeltaMiddayAfternoon.toFixed(2)),
    morningLuma: morning.image.lumaMean,
    middayLuma: midday.image.lumaMean,
    lateAfternoonLuma: afternoon.image.lumaMean,
  };
}

function pearsonCorrelation(a, b) {
  const n = Math.min(a.length, b.length);
  if (!n) return 0;
  let ma = 0,
    mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i];
    mb += b[i];
  }
  ma /= n;
  mb /= n;
  let num = 0,
    da = 0,
    db = 0;
  for (let i = 0; i < n; i++) {
    const xa = a[i] - ma;
    const xb = b[i] - mb;
    num += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }
  const denom = Math.sqrt(da * db);
  if (denom < 1e-6) return 1;
  return num / denom;
}

/**
 * Compares two PNG buffers + capture metadata and classifies whether differences are:
 * - 'identical'
 * - 'minor-render-noise'
 * - 'expected-time-or-lighting-difference'
 * - 'expected-weather-difference'
 * - 'camera-pose-changed'
 * - 'dimension-mismatch'
 * - 'rendering-regression'
 */
export function compareCapturePair({
  baselineCapture,
  candidateCapture,
  baselineBuffer,
  candidateBuffer,
  diffOutputPath = null,
}) {
  const basePng = decodePng(baselineBuffer);
  const candPng = decodePng(candidateBuffer);

  if (basePng.width !== candPng.width || basePng.height !== candPng.height) {
    return {
      id: candidateCapture?.id || baselineCapture?.id || 'unknown',
      classification: 'dimension-mismatch',
      isRegression: true,
      summary: `Viewport dimension mismatch: baseline ${basePng.width}×${basePng.height} vs candidate ${candPng.width}×${candPng.height}`,
      metrics: {
        baselineDimensions: [basePng.width, basePng.height],
        candidateDimensions: [candPng.width, candPng.height],
      },
    };
  }

  const { width, height } = basePng;
  const totalPixels = width * height;
  const diffRgba = diffOutputPath ? new Uint8Array(totalPixels * 4) : null;

  let sumSqDiff = 0;
  let changedPixels = 0;
  let sumSignedDR = 0;
  let sumSignedDG = 0;
  let sumSignedDB = 0;

  for (let i = 0; i < totalPixels * 4; i += 4) {
    const r0 = basePng.rgba[i];
    const g0 = basePng.rgba[i + 1];
    const b0 = basePng.rgba[i + 2];
    const r1 = candPng.rgba[i];
    const g1 = candPng.rgba[i + 1];
    const b1 = candPng.rgba[i + 2];

    const dr = r1 - r0;
    const dg = g1 - g0;
    const db = b1 - b0;
    sumSignedDR += dr;
    sumSignedDG += dg;
    sumSignedDB += db;

    const absMax = Math.max(Math.abs(dr), Math.abs(dg), Math.abs(db));
    const sq = (dr * dr + dg * dg + db * db) / 3;
    sumSqDiff += sq;
    if (absMax > 8) changedPixels++;

    if (diffRgba) {
      if (absMax > 8) {
        const boost = Math.min(255, Math.round(absMax * 2.5));
        diffRgba[i] = 255;
        diffRgba[i + 1] = Math.max(0, 180 - boost);
        diffRgba[i + 2] = 40;
        diffRgba[i + 3] = 255;
      } else {
        const luma = Math.round(0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1);
        const dim = Math.round(luma * 0.35);
        diffRgba[i] = dim;
        diffRgba[i + 1] = dim;
        diffRgba[i + 2] = dim;
        diffRgba[i + 3] = 255;
      }
    }
  }

  if (diffOutputPath && diffRgba) {
    fs.mkdirSync(path.dirname(diffOutputPath), { recursive: true });
    fs.writeFileSync(diffOutputPath, encodePng({ width, height, rgba: diffRgba }));
  }

  const rmse = Math.sqrt(sumSqDiff / Math.max(1, totalPixels));
  const changedRatio = changedPixels / Math.max(1, totalPixels);

  const meanDR = sumSignedDR / Math.max(1, totalPixels);
  const meanDG = sumSignedDG / Math.max(1, totalPixels);
  const meanDB = sumSignedDB / Math.max(1, totalPixels);

  // Measure residual RMSE after removing global illumination/tint offset (meanDR, meanDG, meanDB)
  let residualSq = 0;
  const sampleStep = Math.max(1, Math.floor(totalPixels / 25000)) * 4;
  let residualSamples = 0;
  for (let i = 0; i < totalPixels * 4; i += sampleStep) {
    const rdr = candPng.rgba[i] - basePng.rgba[i] - meanDR;
    const rdg = candPng.rgba[i + 1] - basePng.rgba[i + 1] - meanDG;
    const rdb = candPng.rgba[i + 2] - basePng.rgba[i + 2] - meanDB;
    residualSq += (rdr * rdr + rdg * rdg + rdb * rdb) / 3;
    residualSamples++;
  }
  const residualRmse = Math.sqrt(residualSq / Math.max(1, residualSamples));
  const globalIlluminationExplained =
    rmse > 0.5 ? Math.max(0, 1 - residualRmse / rmse) : 1;

  const sigBase = computeStructuralSignature(basePng);
  const sigCand = computeStructuralSignature(candPng);
  const edgeCorrelation = pearsonCorrelation(sigBase.edgeGrid, sigCand.edgeGrid);
  let edgeDiffSum = 0;
  for (let i = 0; i < sigBase.edgeGrid.length; i++) {
    edgeDiffSum += Math.abs(sigCand.edgeGrid[i] - sigBase.edgeGrid[i]) / 255;
  }
  const structuralEdgeDiff = edgeDiffSum / sigBase.edgeGrid.length;

  // Metadata comparisons
  const poseDelta =
    baselineCapture?.camera && candidateCapture?.camera
      ? Math.hypot(
          (baselineCapture.camera.x || 0) - (candidateCapture.camera.x || 0),
          (baselineCapture.camera.z || 0) - (candidateCapture.camera.z || 0)
        ) + Math.abs((baselineCapture.camera.yawRad || 0) - (candidateCapture.camera.yawRad || 0))
      : 0;

  const timeChanged =
    baselineCapture?.minute !== undefined &&
    candidateCapture?.minute !== undefined &&
    baselineCapture.minute !== candidateCapture.minute;
  const lightingChanged =
    baselineCapture?.lighting &&
    candidateCapture?.lighting &&
    baselineCapture.lighting !== candidateCapture.lighting;
  const weatherChanged =
    baselineCapture?.weather &&
    candidateCapture?.weather &&
    baselineCapture.weather !== candidateCapture.weather;

  const candidateMissingGeo = !!candidateCapture?.diagnostics?.missingGeometry;
  const candidateBrowserErrors = (candidateCapture?.diagnostics?.browserErrors?.length || 0) > 0;
  const baseTriangles = baselineCapture?.metrics?.triangles || 0;
  const candTriangles = candidateCapture?.metrics?.triangles || 0;
  const triangleDropRatio =
    baseTriangles > 0 ? Math.max(0, (baseTriangles - candTriangles) / baseTriangles) : 0;

  let classification = 'identical';
  let isRegression = false;
  let summary = 'Images match identically.';

  if (candidateMissingGeo || candidateBrowserErrors || triangleDropRatio > 0.25) {
    classification = 'rendering-regression';
    isRegression = true;
    summary = `Rendering regression: ${
      candidateMissingGeo
        ? 'missing geometry / blank frame'
        : candidateBrowserErrors
          ? 'browser error detected'
          : `triangle count dropped by ${(triangleDropRatio * 100).toFixed(1)}%`
    }.`;
  } else if (poseDelta > 0.05) {
    classification = 'camera-pose-changed';
    isRegression = true;
    summary = `Camera pose shifted by ${poseDelta.toFixed(3)} units/rad between baseline and candidate.`;
  } else if (rmse < 0.5 && changedRatio < 0.001) {
    classification = 'identical';
    isRegression = false;
    summary = 'Bit-exact or near-exact match (RMSE < 0.5).';
  } else if (weatherChanged && edgeCorrelation >= 0.78) {
    classification = 'expected-weather-difference';
    isRegression = false;
    summary = `Expected weather difference (${baselineCapture.weather} → ${candidateCapture.weather}); building edge structure preserved (r=${edgeCorrelation.toFixed(2)}).`;
  } else if (
    (timeChanged || lightingChanged) &&
    edgeCorrelation >= 0.75
  ) {
    classification = 'expected-time-or-lighting-difference';
    isRegression = false;
    summary = `Expected time/lighting shift (${baselineCapture?.timeLabel || baselineCapture?.lighting} → ${candidateCapture?.timeLabel || candidateCapture?.lighting}); silhouette/edge correlation r=${edgeCorrelation.toFixed(2)}.`;
  } else if (rmse < 2.0 && structuralEdgeDiff < 0.015 && edgeCorrelation >= 0.96) {
    classification = 'minor-render-noise';
    isRegression = false;
    summary = `Negligible rendering variance (RMSE ${rmse.toFixed(2)}, structural edge correlation ${edgeCorrelation.toFixed(3)}).`;
  } else if (
    edgeCorrelation >= 0.88 &&
    structuralEdgeDiff < 0.028 &&
    globalIlluminationExplained >= 0.45
  ) {
    classification = 'expected-time-or-lighting-difference';
    isRegression = false;
    summary = `Global illumination/tint shift with preserved building geometry (edge correlation r=${edgeCorrelation.toFixed(2)}, ${(globalIlluminationExplained * 100).toFixed(0)}% explained by global luminance/colour offset).`;
  } else {
    classification = 'rendering-regression';
    isRegression = true;
    summary = `Visual rendering change or regression detected (RMSE ${rmse.toFixed(2)}, ${(changedRatio * 100).toFixed(1)}% pixels changed, structural edge correlation r=${edgeCorrelation.toFixed(2)}).`;
  }

  return {
    id: candidateCapture?.id || baselineCapture?.id || 'unknown',
    locationId: candidateCapture?.locationId || baselineCapture?.locationId || null,
    viewport: candidateCapture?.viewport || baselineCapture?.viewport || null,
    lighting: candidateCapture?.lighting || baselineCapture?.lighting || null,
    classification,
    isRegression,
    summary,
    diffRelativePath: null,
    metrics: {
      rmse: Number(rmse.toFixed(2)),
      residualRmse: Number(residualRmse.toFixed(2)),
      changedPixels,
      changedRatio: Number(changedRatio.toFixed(4)),
      edgeCorrelation: Number(edgeCorrelation.toFixed(4)),
      structuralEdgeDiff: Number(structuralEdgeDiff.toFixed(4)),
      globalIlluminationExplained: Number(globalIlluminationExplained.toFixed(3)),
      triangleDropRatio: Number(triangleDropRatio.toFixed(4)),
    },
  };
}

/**
 * Compares a full candidate manifest against an earlier baseline manifest (or directory containing manifest.json).
 */
export function compareManifests({ baselinePath, candidateManifest, candidateDir, writeDiffs = true }) {
  const resolvedBaseManifestPath = fs.statSync(baselinePath).isDirectory()
    ? path.join(baselinePath, 'manifest.json')
    : baselinePath;
  const baselineDir = path.dirname(resolvedBaseManifestPath);
  const baselineManifest = JSON.parse(fs.readFileSync(resolvedBaseManifestPath, 'utf8'));

  const baseById = new Map((baselineManifest.captures || []).map((c) => [c.id, c]));
  const results = [];

  for (const cand of candidateManifest.captures || []) {
    const base = baseById.get(cand.id);
    if (!base) {
      results.push({
        id: cand.id,
        locationId: cand.locationId,
        viewport: cand.viewport,
        lighting: cand.lighting,
        classification: 'new-capture',
        isRegression: false,
        summary: 'Capture not present in baseline manifest.',
        diffRelativePath: null,
        metrics: null,
      });
      continue;
    }

    const baseImgPath = path.join(baselineDir, base.image.relativePath);
    const candImgPath = path.join(candidateDir, cand.image.relativePath);
    if (!fs.existsSync(baseImgPath) || !fs.existsSync(candImgPath)) {
      results.push({
        id: cand.id,
        locationId: cand.locationId,
        viewport: cand.viewport,
        lighting: cand.lighting,
        classification: 'missing-screenshot',
        isRegression: true,
        summary: 'Missing baseline or candidate screenshot PNG on disk.',
        diffRelativePath: null,
        metrics: null,
      });
      continue;
    }

    const diffRel = writeDiffs ? path.posix.join('diffs', `${cand.id}-diff.png`) : null;
    const diffAbs = diffRel ? path.join(candidateDir, diffRel) : null;

    const cmp = compareCapturePair({
      baselineCapture: base,
      candidateCapture: cand,
      baselineBuffer: fs.readFileSync(baseImgPath),
      candidateBuffer: fs.readFileSync(candImgPath),
      diffOutputPath: diffAbs,
    });
    cmp.diffRelativePath = diffRel;
    results.push(cmp);
  }

  const regressions = results.filter((r) => r.isRegression);
  const expectedShifts = results.filter((r) =>
    r.classification.startsWith('expected-')
  );
  const identicalCount = results.filter(
    (r) => r.classification === 'identical' || r.classification === 'minor-render-noise'
  ).length;

  return {
    baselineCommitSha: baselineManifest.commitSha || 'unknown',
    baselineTimestamp: baselineManifest.generatedAt || null,
    candidateCommitSha: candidateManifest.commitSha || 'unknown',
    candidateTimestamp: candidateManifest.generatedAt || null,
    totalCompared: results.length,
    identicalOrNoiseCount: identicalCount,
    expectedShiftCount: expectedShifts.length,
    regressionCount: regressions.length,
    passed: regressions.length === 0,
    results,
  };
}
