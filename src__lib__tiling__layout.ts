import type { Job, Surface } from "./types";

export type PlacedTile = {
  x: number;
  w: number;
  cut: boolean;
  sliver: boolean;
};

export type AxisPlan = {
  lengthM: number;
  tileM: number;
  gapM: number;
  pitchM: number;
  startOffsetM: number;
  tiles: PlacedTile[];
  fullCount: number;
  cutCount: number;
  leftCutM: number;
  rightCutM: number;
  minCutM: number;
  minCutPct: number;
  method: string;
  advice: string;
  warning: string | null;
};

function simulate(start: number, length: number, tile: number, pitch: number, minGood: number): PlacedTile[] {
  const tiles: PlacedTile[] = [];
  let x = start;
  let guard = 0;
  while (x < length - 0.0004 && guard < 400) {
    const left = Math.max(0, x);
    const right = Math.min(length, x + tile);
    if (right - left > 0.0004) {
      const w = right - left;
      tiles.push({
        x: left,
        w,
        cut: w < tile - 0.0008,
        sliver: w < minGood - 0.0004,
      });
    }
    x += pitch;
    guard += 1;
  }
  return tiles;
}

function scorePlan(tiles: PlacedTile[], tile: number): number {
  if (tiles.length === 0) return -1e9;
  const left = tiles[0].w;
  const right = tiles[tiles.length - 1].w;
  const minCut = Math.min(left, right);
  const even = 1 - Math.abs(left - right) / Math.max(tile, 0.001);
  const slivers = tiles.filter((t) => t.sliver).length;
  return minCut * 3 + even * tile + tiles.length * 0.001 - slivers * tile;
}

function describeMethod(start: number, length: number, tile: number, pitch: number): string {
  const centre = length / 2;
  const tileCentreStart = centre - tile / 2;
  const jointStart = centre - pitch / 2;
  if (Math.abs(start - 0) < 0.004) return "Full tile from the left edge";
  if (Math.abs(start - tileCentreStart) < 0.008 || Math.abs(((start % pitch) + pitch) % pitch - ((tileCentreStart % pitch) + pitch) % pitch) < 0.008) {
    return "Centre a tile on the run";
  }
  if (Math.abs(((start % pitch) + pitch) % pitch - ((jointStart % pitch) + pitch) % pitch) < 0.008) {
    return "Centre a grout joint on the run";
  }
  return "Shifted off-centre to keep cuts even";
}

export function planAxis(lengthM: number, tileMm: number, spacerMm: number): AxisPlan {
  const tile = Math.max(1, tileMm) / 1000;
  const gap = Math.max(0, spacerMm) / 1000;
  const pitch = tile + gap;
  const length = Math.max(0.05, lengthM);
  const minGood = tile / 3;

  const candidates: number[] = [0, -tile / 2, length / 2 - tile / 2];
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    candidates.push(-tile + (pitch * i) / steps);
  }

  let bestStart = 0;
  let bestTiles = simulate(0, length, tile, pitch, minGood);
  let bestScore = scorePlan(bestTiles, tile);

  for (const start of candidates) {
    const tiles = simulate(start, length, tile, pitch, minGood);
    const s = scorePlan(tiles, tile);
    if (s > bestScore) {
      bestScore = s;
      bestStart = start;
      bestTiles = tiles;
    }
  }

  const leftCutM = bestTiles[0]?.w ?? 0;
  const rightCutM = bestTiles[bestTiles.length - 1]?.w ?? 0;
  const minCutM = Math.min(leftCutM, rightCutM);
  const minCutPct = tile > 0 ? (minCutM / tile) * 100 : 0;
  const method = describeMethod(bestStart, length, tile, pitch);

  const leftMm = Math.round(leftCutM * 1000);
  const rightMm = Math.round(rightCutM * 1000);
  const startFromLeft = Math.max(0, bestStart);
  const startMm = Math.round(startFromLeft * 1000);

  let advice: string;
  if (bestTiles.length <= 1) {
    advice = `This run is a single cut of ${leftMm} mm. Dry-lay and check the cut is not a sliver.`;
  } else if (minCutPct >= 33) {
    advice = `${method}. Start ${startMm} mm in from the left so the left cut is ${leftMm} mm and the right cut is ${rightMm} mm. Both ends stay above a third of a tile.`;
  } else {
    advice = `${method}. Best available cuts are ${leftMm} mm and ${rightMm} mm. One end is under a third of a tile — hide the sliver under a trim, behind a WC, or under a bath if you can.`;
  }

  const warning =
    minCutPct < 25
      ? "Sliver cut under 25% of the tile. Shift the starting wall, use a trim, or drop a full tile and split a larger cut either side."
      : minCutPct < 33
        ? "Edge cut is under a third of a tile. Fine if it sits somewhere discreet."
        : null;

  return {
    lengthM: length,
    tileM: tile,
    gapM: gap,
    pitchM: pitch,
    startOffsetM: startFromLeft,
    tiles: bestTiles,
    fullCount: bestTiles.filter((t) => !t.cut).length,
    cutCount: bestTiles.filter((t) => t.cut).length,
    leftCutM,
    rightCutM,
    minCutM,
    minCutPct,
    method,
    advice,
    warning,
  };
}

export type SurfaceLayout = {
  surfaceId: string;
  name: string;
  kind: Surface["kind"];
  width: AxisPlan;
  height: AxisPlan;
  summary: string;
};

export function layoutJob(job: Job): SurfaceLayout[] {
  return job.surfaces
    .filter((s) => s.widthM > 0 && s.heightM > 0)
    .map((s) => {
      const width = planAxis(s.widthM, job.tile.widthMm, job.tile.spacerMm);
      const height = planAxis(s.heightM, job.tile.heightMm, job.tile.spacerMm);
      const startHint =
        s.kind === "floor"
          ? `On ${s.name}, set out from the most visible doorway. Width: ${width.method.toLowerCase()}. Length: ${height.method.toLowerCase()}.`
          : `On ${s.name}, strike a plumb line ${Math.round(width.startOffsetM * 1000)} mm in from the left and a level line ${Math.round(height.startOffsetM * 1000)} mm up from the floor (or from the bath edge if you are tiling above a bath).`;
      return {
        surfaceId: s.id,
        name: s.name,
        kind: s.kind,
        width,
        height,
        summary: startHint,
      };
    });
}

export function primaryAdvice(job: Job): string {
  const layouts = layoutJob(job);
  if (layouts.length === 0) return "Add a wall or floor with measurements to get a starting line.";
  const worst = layouts
    .slice()
    .sort((a, b) => a.width.minCutPct - b.width.minCutPct)[0];
  const vis = layouts.find((l) => /door|window|main|feature/i.test(l.name)) ?? layouts[0];
  return `${vis.summary} ${worst.width.warning ?? vis.width.advice}`;
}
