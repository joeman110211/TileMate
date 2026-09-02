import type { Job, Rates } from "./types";
import { areaBreakdown, siliconeRunM, trowelMm } from "./calc";

export type MaterialLine = {
  id: string;
  name: string;
  detail: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
  optional: boolean;
};

function adhesiveCoverageM2(trowel: number): number {
  switch (trowel) {
    case 6:
      return 5.5;
    case 8:
      return 4.2;
    case 10:
      return 3.2;
    case 12:
      return 2.4;
    default:
      return 4;
  }
}

function groutKgPerM2(widthMm: number, heightMm: number, spacerMm: number, depthMm: number): number {
  const pitchW = Math.max(1, widthMm) + Math.max(0, spacerMm);
  const pitchH = Math.max(1, heightMm) + Math.max(0, spacerMm);
  const jointMPerM2 = 1000 / pitchW + 1000 / pitchH;
  const volumeM3 = jointMPerM2 * (spacerMm / 1000) * (depthMm / 1000);
  return volumeM3 * 1600;
}

export function materialsFor(job: Job, rates: Rates): MaterialLine[] {
  const area = areaBreakdown(job);
  const lines: MaterialLine[] = [];
  if (area.orderM2 <= 0) return lines;

  const long = Math.max(job.tile.widthMm, job.tile.heightMm);
  const wallTrowel = trowelMm(job.tile.widthMm, job.tile.heightMm, "wall");
  const floorTrowel = trowelMm(job.tile.widthMm, job.tile.heightMm, "floor");
  const wallAdhM2 = area.wallNet * (1 + area.effectiveWastePct / 100);
  const floorAdhM2 = area.floorNet * (1 + area.effectiveWastePct / 100);
  const otherAdhM2 = area.otherNet * (1 + area.effectiveWastePct / 100);
  const wallBags = wallAdhM2 > 0 ? Math.ceil(wallAdhM2 / adhesiveCoverageM2(wallTrowel)) : 0;
  const floorBags = floorAdhM2 > 0 ? Math.ceil(floorAdhM2 / adhesiveCoverageM2(floorTrowel)) : 0;
  const otherBags = otherAdhM2 > 0 ? Math.ceil(otherAdhM2 / adhesiveCoverageM2(wallTrowel)) : 0;
  const bags = Math.max(1, wallBags + floorBags + otherBags);

  lines.push({
    id: "adhesive",
    name: "Tile adhesive",
    detail: `${rates.adhesiveBagKg} kg bags, ${wallTrowel} mm trowel on walls${area.floorNet > 0 ? `, ${floorTrowel} mm on floors` : ""}. C2TE${long >= 600 ? " S1 flexible" : ""} recommended.`,
    qty: bags,
    unit: "bags",
    unitPrice: rates.adhesiveBagPrice,
    total: bags * rates.adhesiveBagPrice,
    optional: false,
  });

  const depth = area.floorNet > area.wallNet ? 10 : 8;
  const kgGrout = groutKgPerM2(job.tile.widthMm, job.tile.heightMm, job.tile.spacerMm, depth) * area.orderM2;
  const groutBags = Math.max(1, Math.ceil(kgGrout / Math.max(1, rates.groutBagKg)));
  lines.push({
    id: "grout",
    name: "Grout",
    detail: `${rates.groutBagKg} kg bags for a ${job.tile.spacerMm} mm joint. Use a flexible, mould-resistant grout in wet rooms and showers.`,
    qty: groutBags,
    unit: "bags",
    unitPrice: rates.groutBagPrice,
    total: groutBags * rates.groutBagPrice,
    optional: false,
  });

  const run = siliconeRunM(job);
  const tubes = Math.max(1, Math.ceil(run / Math.max(1, rates.siliconeMetresPerTube)));
  lines.push({
    id: "silicone",
    name: "Sanitary silicone",
    detail: `${tubes} × 310 ml tubes for about ${run.toFixed(1)} lin m of perimeter, corners and sanitary seals.`,
    qty: tubes,
    unit: "tubes",
    unitPrice: rates.siliconePrice,
    total: tubes * rates.siliconePrice,
    optional: false,
  });

  const primerL = Math.max(1, Math.ceil(area.net / Math.max(1, rates.primerCoverageM2)));
  lines.push({
    id: "primer",
    name: "Primer / SBR",
    detail: "Prime plaster, screed, boards and tanking. Always check the adhesive manufacturer's primer.",
    qty: primerL,
    unit: "packs",
    unitPrice: rates.primerPrice,
    total: primerL * rates.primerPrice,
    optional: false,
  });

  if (area.floorNet > 0) {
    const leveller = Math.max(1, Math.ceil((area.floorNet * 1.1) / Math.max(1, rates.levellerCoverageM2)));
    lines.push({
      id: "leveller",
      name: "Floor levelling compound",
      detail: `Allow ${leveller} bags at ~3 mm for ${area.floorNet.toFixed(2)} m² of floor. Increase if the screed is out of level.`,
      qty: leveller,
      unit: "bags",
      unitPrice: rates.levellerPrice,
      total: leveller * rates.levellerPrice,
      optional: true,
    });
  }

  const wpM2 = job.waterproofing.enabled
    ? Math.max(0, job.waterproofing.wallM2) + Math.max(0, job.waterproofing.floorM2)
    : 0;
  if (wpM2 > 0) {
    const slurry = Math.max(1, Math.ceil((wpM2 * 2) / Math.max(1, rates.tankingCoverageM2)));
    lines.push({
      id: "tanking-kit",
      name: "Tanking kit",
      detail: "Tape, corners, pipe collars and primer for the wet zone.",
      qty: 1,
      unit: "kit",
      unitPrice: rates.tankingKitPrice,
      total: rates.tankingKitPrice,
      optional: false,
    });
    lines.push({
      id: "tanking-slurry",
      name: "Tanking slurry",
      detail: `Two coats over ${wpM2.toFixed(1)} m² of tanked area.`,
      qty: slurry,
      unit: "tubs",
      unitPrice: rates.tankingSlurryPrice,
      total: slurry * rates.tankingSlurryPrice,
      optional: false,
    });
  }

  const trimRuns = job.surfaces
    .filter((s) => s.kind === "wall" || s.kind === "splashback")
    .reduce((sum, s) => sum + s.heightM * 0.5 + s.widthM * 0.25, 0);
  const trimLengths = Math.max(1, Math.ceil(trimRuns / Math.max(0.5, rates.trimLengthM)));
  lines.push({
    id: "trim",
    name: "Tile trim / profiles",
    detail: `${rates.trimLengthM} m lengths for exposed edges, niches and external corners.`,
    qty: trimLengths,
    unit: "lengths",
    unitPrice: rates.trimPrice,
    total: trimLengths * rates.trimPrice,
    optional: true,
  });

  return lines.map((l) => ({ ...l, total: Math.round(l.total * 100) / 100 }));
}

export function materialsTotal(lines: MaterialLine[]): number {
  return Math.round(lines.reduce((s, l) => s + l.total, 0) * 100) / 100;
}
