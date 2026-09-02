export type UpdateItem = {
  key: string;
  label: string;
  value?: number;
  unit?: string;
  note: string;
};

export type UpdateFeed = {
  version: string;
  publishedAt: string;
  summary: string;
  rates?: Partial<{
    labourPerM2: number;
    dayRate: number;
    vatPct: number;
    depositPct: number;
    adhesiveBagPrice: number;
    groutBagPrice: number;
    siliconePrice: number;
    primerPrice: number;
    levellerPrice: number;
    tankingKitPrice: number;
    tankingSlurryPrice: number;
    trimPrice: number;
  }>;
  items: UpdateItem[];
  sources: { title: string; url: string; note: string }[];
};

export const OFFICIAL_SOURCES = [
  { title: "GOV.UK VAT rates", url: "https://www.gov.uk/vat-rates", note: "Current VAT rates and changes." },
  { title: "ONS construction output price indices", url: "https://www.ons.gov.uk/businessindustryandtrade/constructionindustry/datasets/interimconstructionoutputpriceindices/current", note: "UK construction output price movements." },
  { title: "GOV.UK National Minimum Wage", url: "https://www.gov.uk/national-minimum-wage-rates", note: "Statutory minimum hourly rates. Not a recommended tiler rate." },
  { title: "HSE construction guidance", url: "https://www.hse.gov.uk/construction/index.htm", note: "Construction health and safety guidance." },
  { title: "HSE CDM 2015", url: "https://www.hse.gov.uk/construction/cdm/2015/", note: "Construction (Design and Management) guidance." },
  { title: "BSI BS 5385", url: "https://knowledge.bsigroup.com/products/bs-5385-wall-and-floor-tiling", note: "Current British Standards family for wall and floor tiling." },
];

export async function fetchUpdateFeed(url: string, timeoutMs = 8000): Promise<UpdateFeed> {
  const endpoint = url.trim() || `${window.location.origin}/tilemate-updates.json`;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Update server returned ${response.status}`);
    const feed = (await response.json()) as UpdateFeed;
    if (!feed?.version || !feed.publishedAt || !Array.isArray(feed.items)) throw new Error("Invalid update feed");
    return feed;
  } finally {
    window.clearTimeout(timer);
  }
}

export function isUpdateDue(lastCheckedAt: number | null, now = Date.now()): boolean {
  if (!lastCheckedAt) return true;
  return now - lastCheckedAt >= 28 * 24 * 60 * 60 * 1000;
}
