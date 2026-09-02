export const JOB_TYPES = [
  "bathroom_walls",
  "bathroom_floor",
  "bathroom_refit",
  "wet_room",
  "kitchen_splashback",
  "kitchen_floor",
  "utility",
  "hallway_floor",
  "other",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export const JOB_TYPE_LABEL: Record<JobType, string> = {
  bathroom_walls: "Bathroom walls",
  bathroom_floor: "Bathroom floor",
  bathroom_refit: "Bathroom refit",
  wet_room: "Wet room",
  kitchen_splashback: "Kitchen splashback",
  kitchen_floor: "Kitchen floor",
  utility: "Utility / cloakroom",
  hallway_floor: "Hallway / floor",
  other: "Other",
};

export const STATUSES = [
  "draft",
  "quoted",
  "accepted",
  "booked",
  "in_progress",
  "complete",
  "invoiced",
  "paid",
  "declined",
] as const;

export type JobStatus = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<JobStatus, string> = {
  draft: "Draft",
  quoted: "Quote sent",
  accepted: "Accepted",
  booked: "Booked",
  in_progress: "On site",
  complete: "Complete",
  invoiced: "Invoiced",
  paid: "Paid",
  declined: "Declined",
};

export const SURFACE_KINDS = ["wall", "floor", "splashback", "ceiling"] as const;
export type SurfaceKind = (typeof SURFACE_KINDS)[number];

export const OPENING_KINDS = ["window", "door", "niche", "bath", "other"] as const;
export type OpeningKind = (typeof OPENING_KINDS)[number];

export const PATTERNS = [
  "straight",
  "brick",
  "herringbone",
  "diagonal",
  "basket",
] as const;
export type Pattern = (typeof PATTERNS)[number];

export const PATTERN_LABEL: Record<Pattern, string> = {
  straight: "Straight stack",
  brick: "Brick / half bond",
  herringbone: "Herringbone",
  diagonal: "Diagonal 45°",
  basket: "Basket weave",
};

export type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type Opening = {
  id: string;
  kind: OpeningKind;
  name: string;
  widthM: number;
  heightM: number;
};

export type Surface = {
  id: string;
  name: string;
  kind: SurfaceKind;
  widthM: number;
  heightM: number;
  openings: Opening[];
  notes: string;
};

export type Waterproofing = {
  enabled: boolean;
  preset: "none" | "shower" | "wet_room" | "custom";
  wallM2: number;
  floorM2: number;
  notes: string;
};

export type ExtraLine = {
  id: string;
  label: string;
  qty: number;
  unit: string;
  unitPrice: number;
  notes: string;
};

export type PhotoNote = {
  id: string;
  dataUrl: string;
  caption: string;
  advice: string;
  createdAt: number;
};

export type TileSpec = {
  name: string;
  widthMm: number;
  heightMm: number;
  thicknessMm: number;
  spacerMm: number;
  wastePct: number;
  pattern: Pattern;
  pricePerM2: number;
  supplyTiles: boolean;
};

export type Documents = {
  quoteNo: string;
  quoteSentAt: number | null;
  acceptedAt: number | null;
  bookingDate: string;
  depositDueAt: number | null;
  depositPaidAt: number | null;
  invoiceNo: string;
  invoicedAt: number | null;
  paidAt: number | null;
  customerMessage: string;
};

export type Job = {
  id: string;
  name: string;
  customer: Customer;
  siteAddress: string;
  jobType: JobType;
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
  surfaces: Surface[];
  tile: TileSpec;
  waterproofing: Waterproofing;
  extras: ExtraLine[];
  photos: PhotoNote[];
  notes: string;
  internalNotes: string;
  docs: Documents;
  vatOverride: number | null;
  depositPctOverride: number | null;
  labourDayRateOverride: number | null;
};

export type Rates = {
  labourPerM2: number;
  dayRate: number;
  hoursPerDay: number;
  vatPct: number;
  depositPct: number;
  chargeVat: boolean;
  adhesiveBagPrice: number;
  groutBagPrice: number;
  siliconePrice: number;
  primerPrice: number;
  levellerPrice: number;
  tankingKitPrice: number;
  tankingSlurryPrice: number;
  trimPrice: number;
  adhesiveBagKg: number;
  groutBagKg: number;
  primerCoverageM2: number;
  levellerCoverageM2: number;
  tankingCoverageM2: number;
  siliconeMetresPerTube: number;
  trimLengthM: number;
};

export type ProfileTemplate = "clean" | "craft" | "premium";

export type Business = {
  name: string;
  owner: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  vatNumber: string;
  insuranceNote: string;
  terms: string;
  quoteValidityDays: number;
  paymentTermsDays: number;
  tradeType: string;
  profileTagline: string;
  profileBio: string;
  profileServices: string;
  profileArea: string;
  profileTemplate: ProfileTemplate;
  profileAccent: string;
  profileCta: string;
  facebook: string;
  instagram: string;
  checkatrade: string;
  publicProfileBaseUrl: string;
  updateFeedUrl: string;
  bankName: string;
  bankSort: string;
  bankAccount: string;
};

export const TILE_PRESETS: { label: string; widthMm: number; heightMm: number }[] = [
  { label: "150 × 150 mm", widthMm: 150, heightMm: 150 },
  { label: "200 × 200 mm", widthMm: 200, heightMm: 200 },
  { label: "300 × 300 mm", widthMm: 300, heightMm: 300 },
  { label: "300 × 600 mm", widthMm: 300, heightMm: 600 },
  { label: "400 × 400 mm", widthMm: 400, heightMm: 400 },
  { label: "600 × 300 mm", widthMm: 600, heightMm: 300 },
  { label: "600 × 600 mm", widthMm: 600, heightMm: 600 },
  { label: "800 × 800 mm", widthMm: 800, heightMm: 800 },
  { label: "900 × 450 mm", widthMm: 900, heightMm: 450 },
  { label: "1200 × 600 mm", widthMm: 1200, heightMm: 600 },
  { label: "Mosaic 25 × 25 mm", widthMm: 25, heightMm: 25 },
  { label: "Mosaic 50 × 50 mm", widthMm: 50, heightMm: 50 },
];

export const SPACER_PRESETS = [1, 1.5, 2, 3, 4, 5, 6, 8, 10];
