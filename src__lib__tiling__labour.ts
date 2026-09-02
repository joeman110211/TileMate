import type { ExtraLine, Job, JobType, Pattern, Rates } from "./types";
import { areaBreakdown } from "./calc";
import { materialsFor, materialsTotal } from "./materials";

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function tileSizeMultiplier(widthMm: number, heightMm: number): { hours: number; pay: number; label: string } {
  const area = (widthMm / 1000) * (heightMm / 1000);
  const long = Math.max(widthMm, heightMm);
  const short = Math.min(widthMm, heightMm);
  if (area <= 0.004 || long <= 50) {
    return { hours: 2.6, pay: 1.7, label: "Mosaic / very small format — slow, fiddly, high grout time" };
  }
  if (area <= 0.04 || long <= 150) {
    return { hours: 1.9, pay: 1.4, label: "Small format — more cuts and grout lines" };
  }
  if (long >= 900 || area >= 0.64) {
    return { hours: 1.55, pay: 1.35, label: "Extra-large format — handling, levelling and two-person lifts" };
  }
  if (short >= 600 || area >= 0.36) {
    return { hours: 1.35, pay: 1.22, label: "Large format — more prep and lippage control" };
  }
  return { hours: 1, pay: 1, label: "Standard format" };
}

function patternMultiplier(pattern: Pattern): number {
  switch (pattern) {
    case "brick":
      return 1.08;
    case "diagonal":
      return 1.28;
    case "herringbone":
      return 1.45;
    case "basket":
      return 1.3;
    default:
      return 1;
  }
}

function jobTypeHours(jobType: JobType): number {
  if (jobType === "bathroom_refit") return 3;
  if (jobType === "wet_room") return 4;
  if (jobType === "kitchen_splashback") return 1.5;
  return 0;
}

export type LabourEstimate = {
  hoursPerM2: number;
  sizeLabel: string;
  tilingHours: number;
  prepHours: number;
  waterproofHours: number;
  extraHours: number;
  totalHours: number;
  days: number;
  labourM2: number;
  labour: number;
  dayRateTotal: number;
  recommended: number;
};

export function labourFor(job: Job, rates: Rates): LabourEstimate {
  const area = areaBreakdown(job);
  const size = tileSizeMultiplier(job.tile.widthMm, job.tile.heightMm);
  const pattern = patternMultiplier(job.tile.pattern);
  const hoursPerM2 = 1.15 * size.hours * pattern;
  const tilingHours = area.net * hoursPerM2;
  const prepHours = area.floorNet * 0.35 + area.wallNet * 0.12;
  const wpM2 = job.waterproofing.enabled
    ? job.waterproofing.wallM2 + job.waterproofing.floorM2
    : 0;
  const waterproofHours = wpM2 * 0.45 + (wpM2 > 0 ? 1.5 : 0);
  const extraHours = jobTypeHours(job.jobType);
  const totalHours = tilingHours + prepHours + waterproofHours + extraHours;
  const days = Math.max(0.5, Math.ceil((totalHours / Math.max(1, rates.hoursPerDay)) * 2) / 2);
  const hourly = rates.dayRate / Math.max(1, rates.hoursPerDay);
  const tilingPay = area.net * rates.labourPerM2 * size.pay * pattern;
  const otherPay = (prepHours + waterproofHours + extraHours) * hourly;
  const recommended = roundMoney(tilingPay + otherPay);
  return {
    hoursPerM2,
    sizeLabel: size.label,
    tilingHours,
    prepHours,
    waterproofHours,
    extraHours,
    totalHours,
    days,
    labourM2: roundMoney(tilingPay),
    labour: recommended,
    dayRateTotal: roundMoney(days * rates.dayRate),
    recommended,
  };
}

export function extrasTotal(extras: ExtraLine[]): number {
  return extras.reduce((s, e) => s + e.qty * e.unitPrice, 0);
}

export type QuoteTotals = {
  tiles: number;
  materials: number;
  labour: number;
  extras: number;
  net: number;
  vatPct: number;
  vat: number;
  gross: number;
  depositPct: number;
  deposit: number;
  balance: number;
};

export function quoteTotals(job: Job, rates: Rates): QuoteTotals {
  const area = areaBreakdown(job);
  const mats = materialsFor(job, rates);
  const labour = labourFor(job, rates);
  const tiles = job.tile.supplyTiles ? roundMoney(area.orderM2 * job.tile.pricePerM2) : 0;
  const materials = materialsTotal(mats);
  const extras = roundMoney(extrasTotal(job.extras));
  const net = roundMoney(tiles + materials + labour.recommended + extras);
  const vatPct = job.vatOverride ?? (rates.chargeVat ? rates.vatPct : 0);
  const vat = roundMoney(net * (vatPct / 100));
  const gross = roundMoney(net + vat);
  const depositPct = job.depositPctOverride ?? rates.depositPct;
  const deposit = roundMoney(gross * (depositPct / 100));
  return {
    tiles,
    materials,
    labour: labour.recommended,
    extras,
    net,
    vatPct,
    vat,
    gross,
    depositPct,
    deposit,
    balance: roundMoney(gross - deposit),
  };
}
