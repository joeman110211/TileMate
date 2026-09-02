import { uid } from "@/lib/utils";
import type { Business, Job, Rates, Surface } from "./types";

export const DEFAULT_RATES: Rates = {
  labourPerM2: 42,
  dayRate: 280,
  hoursPerDay: 8,
  vatPct: 20,
  depositPct: 30,
  chargeVat: true,
  adhesiveBagPrice: 14,
  groutBagPrice: 19,
  siliconePrice: 8.5,
  primerPrice: 18,
  levellerPrice: 16,
  tankingKitPrice: 48,
  tankingSlurryPrice: 32,
  trimPrice: 9.5,
  adhesiveBagKg: 20,
  groutBagKg: 5,
  primerCoverageM2: 10,
  levellerCoverageM2: 4,
  tankingCoverageM2: 8,
  siliconeMetresPerTube: 7,
  trimLengthM: 2.5,
};

export const DEFAULT_TERMS = `1. This quote is valid for 30 days from the date of issue.
2. A deposit is required to reserve the start date. The deposit is non-refundable once materials have been ordered or the date has been held, except where we cancel.
3. The balance is due on completion, on the day the work is finished, unless otherwise agreed in writing.
4. Prices assume clear access, parking within a reasonable distance, a working supply of water and power, and a safe, empty work area.
5. Any existing tiling, plaster, screed or boards that are unsound, out of level, or not suitable to tile onto will be quoted as a variation before extra work proceeds.
6. Tile quantities include a waste allowance for cuts. Shade, calibre and batch variation is normal. Spare tiles from the same batch should be kept for future repairs.
7. We are not responsible for leaks, movement or failure caused by work carried out by others, or by existing plumbing, heating or structural issues.
8. Wet rooms and showers must not be used until the adhesive, grout and silicone have cured. We will confirm the waiting time on the day (typically 24–72 hours).
9. Variations, extra surfaces, pattern changes or additional waterproofing requested after acceptance will be priced and agreed before the extra work is done.
10. Title to supplied materials remains with us until paid in full. Customer-supplied tiles remain the customer's responsibility for quantity, shade and damage.`;

export const DEFAULT_BUSINESS: Business = {
  name: "TileMate",
  owner: "",
  phone: "",
  email: "",
  address: "",
  website: "",
  vatNumber: "",
  insuranceNote: "Public liability insured. Certificates available on request.",
  terms: DEFAULT_TERMS,
  quoteValidityDays: 30,
  paymentTermsDays: 0,
  tradeType: "Tiling contractor",
  profileTagline: "Professional wall & floor tiling",
  profileBio: "Reliable, tidy tiling for bathrooms, kitchens, floors and wet areas. Clear quotes, careful preparation and professional finishes.",
  profileServices: "Wall tiling, Floor tiling, Bathrooms, Wet rooms, Kitchen splashbacks, Waterproofing, Large-format tiles",
  profileArea: "Local area and surrounding towns",
  profileTemplate: "clean",
  profileAccent: "#3f5d56",
  profileCta: "Request a quote",
  facebook: "",
  instagram: "",
  checkatrade: "",
  publicProfileBaseUrl: "",
  updateFeedUrl: "",
  bankName: "",
  bankSort: "",
  bankAccount: "",
};

export function emptyCustomer() {
  return { name: "", email: "", phone: "", address: "" };
}

export function emptyDocs(): Job["docs"] {
  return {
    quoteNo: "",
    quoteSentAt: null,
    acceptedAt: null,
    bookingDate: "",
    depositDueAt: null,
    depositPaidAt: null,
    invoiceNo: "",
    invoicedAt: null,
    paidAt: null,
    customerMessage: "",
  };
}

export function defaultTile() {
  return {
    name: "300 × 600 mm",
    widthMm: 300,
    heightMm: 600,
    thicknessMm: 9,
    spacerMm: 3,
    wastePct: 12,
    pattern: "straight" as const,
    pricePerM2: 28,
    supplyTiles: false,
  };
}

export function makeSurface(partial: Partial<Surface> & Pick<Surface, "name" | "kind">): Surface {
  return {
    id: uid("surf"),
    widthM: 0,
    heightM: 0,
    openings: [],
    notes: "",
    ...partial,
  };
}

export function nextDocNo(prefix: string, existing: string[]): string {
  const year = new Date().getFullYear();
  const re = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  let max = 0;
  for (const n of existing) {
    const m = n.match(re);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}-${year}-${String(max + 1).padStart(3, "0")}`;
}

export function createJob(partial?: Partial<Job>): Job {
  const now = Date.now();
  return {
    id: uid("job"),
    name: "New job",
    customer: emptyCustomer(),
    siteAddress: "",
    jobType: "bathroom_walls",
    status: "draft",
    createdAt: now,
    updatedAt: now,
    surfaces: [],
    tile: defaultTile(),
    waterproofing: {
      enabled: false,
      preset: "none",
      wallM2: 0,
      floorM2: 0,
      notes: "",
    },
    extras: [],
    photos: [],
    notes: "",
    internalNotes: "",
    docs: emptyDocs(),
    vatOverride: null,
    depositPctOverride: null,
    labourDayRateOverride: null,
    ...partial,
  };
}

export function demoJob(): Job {
  const walls: Surface[] = [
    makeSurface({
      name: "Wall 1 — bath wall",
      kind: "wall",
      widthM: 2.2,
      heightM: 2.4,
      openings: [
        {
          id: uid("op"),
          kind: "window",
          name: "Window",
          widthM: 0.6,
          heightM: 0.9,
        },
      ],
    }),
    makeSurface({
      name: "Wall 2 — vanity",
      kind: "wall",
      widthM: 1.8,
      heightM: 2.4,
    }),
    makeSurface({
      name: "Wall 3 — WC wall",
      kind: "wall",
      widthM: 2.2,
      heightM: 2.4,
      openings: [
        {
          id: uid("op"),
          kind: "door",
          name: "Door",
          widthM: 0.76,
          heightM: 1.98,
        },
      ],
    }),
    makeSurface({
      name: "Wall 4 — towel wall",
      kind: "wall",
      widthM: 1.8,
      heightM: 2.4,
    }),
    makeSurface({
      name: "Floor",
      kind: "floor",
      widthM: 2.2,
      heightM: 1.8,
      openings: [
        {
          id: uid("op"),
          kind: "bath",
          name: "Bath footprint (not tiled)",
          widthM: 1.7,
          heightM: 0.7,
        },
      ],
    }),
  ];

  return createJob({
    name: "12 Oak Avenue — family bathroom",
    customer: {
      name: "Sam Taylor",
      email: "sam.taylor@example.com",
      phone: "07700 900123",
      address: "12 Oak Avenue, Bristol, BS1 4AA",
    },
    siteAddress: "12 Oak Avenue, Bristol, BS1 4AA",
    jobType: "bathroom_refit",
    status: "draft",
    surfaces: walls,
    tile: {
      name: "Matt porcelain 300 × 600",
      widthMm: 300,
      heightMm: 600,
      thicknessMm: 9,
      spacerMm: 3,
      wastePct: 12,
      pattern: "brick",
      pricePerM2: 32,
      supplyTiles: false,
    },
    waterproofing: {
      enabled: true,
      preset: "shower",
      wallM2: 6.4,
      floorM2: 1.6,
      notes: "Tank shower enclosure walls to 2 m and the tray floor.",
    },
    extras: [
      {
        id: uid("ex"),
        label: "Strip existing wall tiles",
        qty: 18,
        unit: "m²",
        unitPrice: 12,
        notes: "Bag up and leave waste for customer skip",
      },
    ],
    notes: "Customer supplying tiles. Match existing 3 mm grout colour — jasmine.",
    internalNotes: "Park on the drive. Key in the porch safe.",
  });
}
