import { DEFAULT_BUSINESS } from "@/lib/tiling/defaults";
import type { Business } from "@/lib/tiling/types";

export type PublicProfile = Pick<
  Business,
  | "name"
  | "owner"
  | "phone"
  | "email"
  | "address"
  | "website"
  | "vatNumber"
  | "tradeType"
  | "profileTagline"
  | "profileBio"
  | "profileServices"
  | "profileArea"
  | "profileTemplate"
  | "profileAccent"
  | "profileCta"
  | "facebook"
  | "instagram"
  | "checkatrade"
>;

const PROFILE_KEYS: (keyof PublicProfile)[] = [
  "name", "owner", "phone", "email", "address", "website", "vatNumber", "tradeType",
  "profileTagline", "profileBio", "profileServices", "profileArea", "profileTemplate", "profileAccent",
  "profileCta", "facebook", "instagram", "checkatrade",
];

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string): string {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function profileFromBusiness(business: Business): PublicProfile {
  return {
    name: business.name,
    owner: business.owner,
    phone: business.phone,
    email: business.email,
    address: business.address,
    website: business.website,
    vatNumber: business.vatNumber,
    tradeType: business.tradeType,
    profileTagline: business.profileTagline,
    profileBio: business.profileBio,
    profileServices: business.profileServices,
    profileArea: business.profileArea,
    profileTemplate: business.profileTemplate,
    profileAccent: business.profileAccent,
    profileCta: business.profileCta,
    facebook: business.facebook,
    instagram: business.instagram,
    checkatrade: business.checkatrade,
  };
}

export function decodeProfile(value: string): PublicProfile | null {
  try {
    const parsed = JSON.parse(fromBase64Url(value)) as Partial<PublicProfile>;
    if (!parsed || typeof parsed.name !== "string") return null;
    return { ...profileFromBusiness(DEFAULT_BUSINESS), ...parsed } as PublicProfile;
  } catch {
    return null;
  }
}

export function profileShareUrl(business: Business): string {
  const base = (business.publicProfileBaseUrl || window.location.origin).replace(/\/$/, "");
  const profile = encodeProfile(profileFromBusiness(business));
  return `${base}/profile?data=${encodeURIComponent(profile)}`;
}

export function shareText(business: Business): string {
  const services = business.profileServices.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 5).join(", ");
  return [
    business.name || business.owner || "Professional tradesperson",
    business.profileTagline,
    services ? `Services: ${services}` : "",
    business.profileArea ? `Serving: ${business.profileArea}` : "",
  ].filter(Boolean).join(" · ");
}
