import type { Job, Pattern, Surface, SurfaceKind } from "./types";

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function round3(n: number): number {
  return Math.round((n + Number.EPSILON) * 1000) / 1000;
}

export function surfaceGrossM2(s: Surface): number {
  return Math.max(0, s.widthM) * Math.max(0, s.heightM);
}

export function openingM2(widthM: number, heightM: number): number {
  return Math.max(0, widthM) * Math.max(0, heightM);
}

export function surfaceOpeningsM2(s: Surface): number {
  return s.openings.reduce((sum, o) => sum + openingM2(o.widthM, o.heightM), 0);
}

export function surfaceNetM2(s: Surface): number {
  return Math.max(0, surfaceGrossM2(s) - surfaceOpeningsM2(s));
}

export function tileModuleM(widthMm: number, heightMm: number, spacerMm: number) {
  const w = Math.max(1, widthMm) / 1000 + Math.max(0, spacerMm) / 1000;
  const h = Math.max(1, heightMm) / 1000 + Math.max(0, spacerMm) / 1000;
  return { w, h, area: w * h };
}

export function patternWasteExtra(pattern: Pattern): number {
  switch (pattern) {
    case "brick":
      return 2;
    case "diagonal":
      return 8;
    case "herringbone":
      return 12;
    case "basket":
      return 8;
    default:
      return 0;
  }
}

export type AreaBreakdown = {
  surfaces: {
    id: string;
    name: string;
    kind: SurfaceKind;
    gross: number;
    openings: number;
    net: number;
  }[];
  gross: number;
  openings: number;
  net: number;
  wastePct: number;
  patternExtraPct: number;
  effectiveWastePct: number;
  wasteM2: number;
  orderM2: number;
  wallNet: number;
  floorNet: number;
  otherNet: number;
};

export function areaBreakdown(job: Job): AreaBreakdown {
  const surfaces = job.surfaces.map((s) => ({
    id: s.id,
    name: s.name,
    kind: s.kind,
    gross: round2(surfaceGrossM2(s)),
    openings: round2(surfaceOpeningsM2(s)),
    net: round2(surfaceNetM2(s)),
  }));
  const gross = round2(surfaces.reduce((a, s) => a + s.gross, 0));
  const openings = round2(surfaces.reduce((a, s) => a + s.openings, 0));
  const net = round2(surfaces.reduce((a, s) => a + s.net, 0));
  const wastePct = Math.max(0, job.tile.wastePct);
  const patternExtraPct = patternWasteExtra(job.tile.pattern);
  const effectiveWastePct = wastePct + patternExtraPct;
  const wasteM2 = round2(net * (effectiveWastePct / 100));
  const orderM2 = round2(net + wasteM2);
  const wallNet = round2(
    surfaces.filter((s) => s.kind === "wall" || s.kind === "splashback").reduce((a, s) => a + s.net, 0),
  );
  const floorNet = round2(surfaces.filter((s) => s.kind === "floor").reduce((a, s) => a + s.net, 0));
  const otherNet = round2(net - wallNet - floorNet);
  return {
    surfaces,
    gross,
    openings,
    net,
    wastePct,
    patternExtraPct,
    effectiveWastePct,
    wasteM2,
    orderM2,
    wallNet,
    floorNet,
    otherNet,
  };
}

export type TileCount = {
  tileAreaM2: number;
  moduleAreaM2: number;
  coverageTiles: number;
  layoutTiles: number;
  recommended: number;
  boxesEstimate: number;
};

export function tilesForSurface(s: Surface, widthMm: number, heightMm: number, spacerMm: number) {
  const mod = tileModuleM(widthMm, heightMm, spacerMm);
  const cols = s.widthM <= 0 ? 0 : Math.ceil(s.widthM / mod.w);
  const rows = s.heightM <= 0 ? 0 : Math.ceil(s.heightM / mod.h);
  return { cols, rows, count: cols * rows };
}

export function tileCount(job: Job): TileCount {
  const area = areaBreakdown(job);
  const { widthMm, heightMm, spacerMm } = job.tile;
  const mod = tileModuleM(widthMm, heightMm, spacerMm);
  const tileAreaM2 = round3((widthMm / 1000) * (heightMm / 1000));
  const coverageTiles = mod.area > 0 ? Math.ceil(area.orderM2 / mod.area) : 0;
  const layoutTiles = job.surfaces.reduce((sum, s) => {
    const t = tilesForSurface(s, widthMm, heightMm, spacerMm);
    return sum + t.count;
  }, 0);
  const layoutWithWaste = Math.ceil(layoutTiles * (1 + area.effectiveWastePct / 100));
  const recommended = Math.max(coverageTiles, layoutWithWaste);
  const perBox = typicalBoxCount(widthMm, heightMm);
  const boxesEstimate = perBox > 0 ? Math.ceil(recommended / perBox) : recommended;
  return {
    tileAreaM2,
    moduleAreaM2: round3(mod.area),
    coverageTiles,
    layoutTiles,
    recommended,
    boxesEstimate,
  };
}

export function typicalBoxCount(widthMm: number, heightMm: number): number {
  const a = (widthMm / 1000) * (heightMm / 1000);
  if (a <= 0.01) return 20;
  if (a <= 0.09) return 11;
  if (a <= 0.18) return 8;
  if (a <= 0.36) return 4;
  if (a <= 0.72) return 2;
  return 2;
}

export function perimeterM(job: Job): number {
  return job.surfaces.reduce((sum, s) => {
    if (s.kind === "floor") return sum + 2 * (s.widthM + s.heightM);
    return sum + s.widthM;
  }, 0);
}

export function siliconeRunM(job: Job): number {
  const floors = job.surfaces.filter((s) => s.kind === "floor");
  const floorPerim = floors.reduce((sum, s) => sum + 2 * (s.widthM + s.heightM), 0);
  const internalCorners = job.surfaces.filter((s) => s.kind === "wall").length;
  const wallHeight = job.surfaces.find((s) => s.kind === "wall")?.heightM ?? 2.4;
  return round2(floorPerim + internalCorners * wallHeight * 0.25);
}

export function trowelMm(widthMm: number, heightMm: number, kind: SurfaceKind): number {
  const long = Math.max(widthMm, heightMm);
  if (kind === "floor") {
    if (long >= 800) return 12;
    if (long >= 600) return 10;
    return 8;
  }
  if (long >= 600) return 10;
  if (long >= 300) return 8;
  return 6;
}
