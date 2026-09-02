import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Share2, Globe, Facebook, Instagram, ExternalLink, Printer } from "lucide-react";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { QrCode } from "@/components/qr-code";
import { profileFromBusiness, decodeProfile, profileShareUrl, shareText, type PublicProfile } from "@/lib/profile";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const hydrated = useHydrated();
  const business = useStore((s) => s.business);
  const data = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("data") : null;
  const publicProfile = useMemo(() => (data ? decodeProfile(data) : null), [data]);

  if (data) return <PublicProfilePage profile={publicProfile} />;

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Profile Studio</p>
            <h1 className="mt-2 font-display text-4xl tracking-tight">Your public profile</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Build a customer-facing page you can share by link, WhatsApp, text, email or social apps. It exposes only the profile fields, never your jobs.
            </p>
          </div>
          <Button variant="outline" asChild><Link to="/settings">Edit profile</Link></Button>
        </div>

        {hydrated ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
            <div>
              <PublicCard profile={profileFromBusiness(business)} preview />
              <div className="no-print mt-3 flex justify-end">
                <Button variant="outline" onClick={() => window.print()}><Printer /> Print / save as PDF</Button>
              </div>
            </div>
            <div className="space-y-4">
              <SharePanel business={business} />
              <QrCode value={profileShareUrl(business)} />
            </div>
          </div>
        ) : <div className="mt-8 h-80 rounded-2xl bg-muted" />}
      </main>
    </AppShell>
  );
}

function PublicProfilePage({ profile }: { profile: PublicProfile | null }) {
  if (!profile) {
    return <div className="grid min-h-dvh place-items-center bg-background p-6"><div className="max-w-md rounded-2xl bg-card p-8 text-center shadow-[var(--shadow-border)]"><h1 className="font-display text-3xl">Profile link expired or invalid</h1><p className="mt-2 text-muted-foreground">The profile data in this link could not be read.</p></div></div>;
  }
  return (
    <div className="min-h-dvh bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-3xl"><PublicCard profile={profile} /></div>
    </div>
  );
}

function PublicCard({ profile, preview = false }: { profile: PublicProfile; preview?: boolean }) {
  const services = profile.profileServices.split(",").map((s) => s.trim()).filter(Boolean);
  const links = [
    [profile.website, "Website", Globe],
    [profile.checkatrade, "Checkatrade", ExternalLink],
    [profile.facebook, "Facebook", Facebook],
    [profile.instagram, "Instagram", Instagram],
  ] as const;
  const accent = profile.profileAccent || "#3f5d56";

  return (
    <article className={`overflow-hidden rounded-3xl shadow-[var(--shadow-border)] ${profile.profileTemplate === "premium" ? "ring-1 ring-black/10" : ""}`} style={{ background: profile.profileTemplate === "craft" ? "#f0ece4" : "#fffcf7" }}>
      <div className="p-7 sm:p-10" style={{ borderTop: `8px solid ${accent}`, background: profile.profileTemplate === "premium" ? `linear-gradient(135deg, ${accent}12, transparent 55%)` : undefined }}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold tracking-wide uppercase">{profile.tradeType}</span>
            <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">{profile.name || "Your business name"}</h2>
            {profile.owner ? <p className="mt-2 text-lg text-muted-foreground">{profile.owner}</p> : null}
            <p className="mt-4 text-xl font-semibold" style={{ color: accent }}>{profile.profileTagline}</p>
          </div>
          <div className="rounded-2xl bg-muted px-4 py-3 text-right text-sm">
            <p className="font-semibold">{profile.profileCta || "Request a quote"}</p>
            <p className="mt-1 text-muted-foreground">{profile.profileArea}</p>
          </div>
        </div>

        <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground">{profile.profileBio}</p>

        {services.length ? <div className="mt-7 flex flex-wrap gap-2">{services.map((service) => <span key={service} className="rounded-full border border-border px-3 py-1.5 text-sm">{service}</span>)}</div> : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {profile.phone ? <a className="flex items-center gap-3 rounded-xl bg-muted p-4" href={`tel:${profile.phone}`}><Phone className="size-4" />{profile.phone}</a> : null}
          {profile.email ? <a className="flex items-center gap-3 rounded-xl bg-muted p-4" href={`mailto:${profile.email}`}><Mail className="size-4" />{profile.email}</a> : null}
          {profile.address ? <div className="flex items-start gap-3 rounded-xl bg-muted p-4 sm:col-span-2"><MapPin className="mt-1 size-4 shrink-0" /><span>{profile.address}</span></div> : null}
        </div>

          <div className="mt-8 flex flex-wrap gap-2">
          {links.filter(([url]) => !!url).map(([url, label, Icon]) => <a key={label} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium" href={url} target="_blank" rel="noreferrer"><Icon className="size-4" />{label}</a>)}
        </div>
        <div className="mt-8 rounded-xl border border-border p-4" style={{ background: `${accent}10` }}>
          <p className="text-sm font-semibold">{profile.profileCta || "Request a quote"}</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap the phone or email above to get in touch.</p>
        </div>
      </div>
      {preview ? <div className="border-t border-border bg-muted/50 px-7 py-4 text-xs text-muted-foreground sm:px-10">Preview only. Customers see this page and nothing else in TileMate.</div> : null}
    </article>
  );
}

function SharePanel({ business }: { business: ReturnType<typeof useStore.getState>["business"] }) {
  const url = profileShareUrl(business);
  const text = shareText(business);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: business.name || "My business profile", text, url });
    } else {
      await navigator.clipboard.writeText(url);
      window.alert("Profile link copied to your clipboard.");
    }
  };
  return (
    <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
      <h2 className="font-display text-2xl">Share it</h2>
      <p className="mt-1 text-sm text-muted-foreground">Android's share sheet can hand this to WhatsApp, Messages, Gmail, Facebook and other installed apps. Humanity survives another integration problem.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button onClick={() => void share()}><Share2 /> Share</Button>
        <Button variant="outline" asChild><a href={`mailto:?subject=${encodeURIComponent(business.name || "My profile")}&body=${encodedText}%0A%0A${encodedUrl}`}>Email</a></Button>
        <Button variant="outline" asChild><a href={`sms:?body=${encodedText}%20${encodedUrl}`}>Text</a></Button>
        <Button variant="outline" asChild><a href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noreferrer">WhatsApp</a></Button>
        <Button variant="outline" asChild><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer">Facebook</a></Button>
        <Button variant="outline" onClick={() => void navigator.clipboard.writeText(url)}>Copy link</Button>
      </div>
      <p className="mt-4 break-all rounded-xl bg-muted p-3 text-xs text-muted-foreground">{url}</p>
    </div>
  );
}
