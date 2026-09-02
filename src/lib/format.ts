export function gbp(n: number, digits = 2): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(n) ? n : 0);
}

export function m2(n: number, digits = 2): string {
  const v = Number.isFinite(n) ? n : 0;
  return `${v.toFixed(digits)} m²`;
}

export function metres(n: number, digits = 2): string {
  const v = Number.isFinite(n) ? n : 0;
  return `${v.toFixed(digits)} m`;
}

export function mm(n: number): string {
  return `${Math.round(n)} mm`;
}

export function linM(n: number, digits = 1): string {
  return `${(Number.isFinite(n) ? n : 0).toFixed(digits)} lin m`;
}

export function qty(n: number): string {
  return String(Math.max(0, Math.ceil(n)));
}

export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ts));
}

export function formatDateLong(ts: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(ts));
}

export function parseNum(raw: string): number {
  const n = Number.parseFloat(String(raw).replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
}
