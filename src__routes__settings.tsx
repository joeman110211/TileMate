import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, RefreshCw, Share2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { NumField } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { fetchUpdateFeed, OFFICIAL_SOURCES } from "@/lib/market";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const hydrated = useHydrated();
  const rates = useStore((s) => s.rates);
  const business = useStore((s) => s.business);
  const updateMeta = useStore((s) => s.updateMeta);
  const setRates = useStore((s) => s.setRates);
  const setBusiness = useStore((s) => s.setBusiness);
  const setUpdateMeta = useStore((s) => s.setUpdateMeta);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");

  const checkNow = async () => {
    setChecking(true); setMessage("");
    try {
      const feed = await fetchUpdateFeed(business.updateFeedUrl);
      if (feed.rates) setRates(feed.rates);
      setUpdateMeta({ lastCheckedAt: Date.now(), lastAppliedAt: Date.parse(feed.publishedAt) || Date.now(), sourceStatus: "fresh", latestNote: feed.summary });
      setMessage(`Updated from feed ${feed.version}.`);
    } catch (error) {
      setUpdateMeta({ lastCheckedAt: Date.now(), sourceStatus: "error", latestNote: error instanceof Error ? error.message : "Update check failed." });
      setMessage("The update check failed. Your existing prices are unchanged.");
    } finally { setChecking(false); }
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="font-display text-4xl tracking-tight">Settings</h1><p className="mt-2 text-muted-foreground">Business identity, quoting rates, customer-facing profile and the update centre.</p></div>
          <Button variant="outline" asChild><Link to="/profile"><Share2 /> Profile & sharing</Link></Button>
        </div>

        {!hydrated ? <div className="mt-8 h-96 rounded-xl bg-muted" /> : null}
        {hydrated ? <div className="mt-8 space-y-10">
          <section className="space-y-4">
            <h2 className="font-display text-2xl">Business</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Trading name"><Input value={business.name} onChange={(e) => setBusiness({ name: e.target.value })} /></Field>
              <Field label="Your name"><Input value={business.owner} onChange={(e) => setBusiness({ owner: e.target.value })} /></Field>
              <Field label="Trade type"><Input value={business.tradeType} onChange={(e) => setBusiness({ tradeType: e.target.value })} /></Field>
              <Field label="Phone"><Input value={business.phone} onChange={(e) => setBusiness({ phone: e.target.value })} /></Field>
              <Field label="Email"><Input type="email" value={business.email} onChange={(e) => setBusiness({ email: e.target.value })} /></Field>
              <Field label="Address"><Input value={business.address} onChange={(e) => setBusiness({ address: e.target.value })} /></Field>
              <Field label="VAT number"><Input value={business.vatNumber} onChange={(e) => setBusiness({ vatNumber: e.target.value })} /></Field>
              <Field label="Website"><Input value={business.website} onChange={(e) => setBusiness({ website: e.target.value })} /></Field>
            </div>
          </section>

          <section className="space-y-4">
            <div><h2 className="font-display text-2xl">Public profile</h2><p className="mt-1 text-sm text-muted-foreground">This is the page customers can see. It contains no jobs, prices, customer records or app controls.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tagline"><Input value={business.profileTagline} onChange={(e) => setBusiness({ profileTagline: e.target.value })} /></Field>
              <Field label="Service area"><Input value={business.profileArea} onChange={(e) => setBusiness({ profileArea: e.target.value })} /></Field>
              <Field label="Services (comma separated)" className="sm:col-span-2"><Input value={business.profileServices} onChange={(e) => setBusiness({ profileServices: e.target.value })} /></Field>
              <Field label="About you / business" className="sm:col-span-2"><Textarea className="min-h-28" value={business.profileBio} onChange={(e) => setBusiness({ profileBio: e.target.value })} /></Field>
              <Field label="Call to action"><Input value={business.profileCta} onChange={(e) => setBusiness({ profileCta: e.target.value })} /></Field>
              <Field label="Profile colour"><div className="flex gap-2"><input aria-label="Profile colour" type="color" value={business.profileAccent} onChange={(e) => setBusiness({ profileAccent: e.target.value })} className="h-10 w-14 rounded-md border border-border bg-card p-1"/><Input value={business.profileAccent} onChange={(e) => setBusiness({ profileAccent: e.target.value })} /></div></Field>
              <Field label="Template"><select value={business.profileTemplate} onChange={(e) => setBusiness({ profileTemplate: e.target.value as typeof business.profileTemplate })} className="h-10 rounded-md border border-border bg-card px-3 text-sm"><option value="clean">Clean</option><option value="craft">Craft</option><option value="premium">Premium</option></select></Field>
              <Field label="Public profile base URL"><Input placeholder="https://your-domain.example" value={business.publicProfileBaseUrl} onChange={(e) => setBusiness({ publicProfileBaseUrl: e.target.value })} /></Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Checkatrade"><Input placeholder="Profile URL" value={business.checkatrade} onChange={(e) => setBusiness({ checkatrade: e.target.value })} /></Field>
              <Field label="Facebook"><Input placeholder="Business page URL" value={business.facebook} onChange={(e) => setBusiness({ facebook: e.target.value })} /></Field>
              <Field label="Instagram"><Input placeholder="Profile URL" value={business.instagram} onChange={(e) => setBusiness({ instagram: e.target.value })} /></Field>
            </div>
          </section>

          <section className="space-y-4">
            <div><h2 className="font-display text-2xl">Labour & tax</h2><p className="mt-1 text-sm text-muted-foreground">Keep your own commercial rates separate from statutory benchmarks.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumField label="Labour rate" suffix="£/m²" step="1" value={rates.labourPerM2} onChange={(n) => setRates({ labourPerM2: n })} />
              <NumField label="Day rate" suffix="£" step="5" value={rates.dayRate} onChange={(n) => setRates({ dayRate: n })} />
              <NumField label="Hours in a day" step="0.5" value={rates.hoursPerDay} onChange={(n) => setRates({ hoursPerDay: n })} />
              <NumField label="Deposit" suffix="%" step="1" value={rates.depositPct} onChange={(n) => setRates({ depositPct: n })} />
              <NumField label="VAT" suffix="%" step="1" value={rates.vatPct} onChange={(n) => setRates({ vatPct: n })} />
              <div className="flex items-center justify-between rounded-md bg-muted px-3"><span className="text-sm font-medium">Charge VAT</span><Switch checked={rates.chargeVat} onCheckedChange={(v) => setRates({ chargeVat: v })} /></div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl">Material prices</h2>
            <p className="text-sm text-muted-foreground">These remain your working merchant prices. Automatic updates may only apply values explicitly supplied by your configured update feed.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumField label="Adhesive bag" suffix="£" step="0.5" value={rates.adhesiveBagPrice} onChange={(n) => setRates({ adhesiveBagPrice: n })} />
              <NumField label="Grout bag" suffix="£" step="0.5" value={rates.groutBagPrice} onChange={(n) => setRates({ groutBagPrice: n })} />
              <NumField label="Silicone tube" suffix="£" step="0.5" value={rates.siliconePrice} onChange={(n) => setRates({ siliconePrice: n })} />
              <NumField label="Primer pack" suffix="£" step="0.5" value={rates.primerPrice} onChange={(n) => setRates({ primerPrice: n })} />
              <NumField label="Leveller bag" suffix="£" step="0.5" value={rates.levellerPrice} onChange={(n) => setRates({ levellerPrice: n })} />
              <NumField label="Tanking kit" suffix="£" step="0.5" value={rates.tankingKitPrice} onChange={(n) => setRates({ tankingKitPrice: n })} />
              <NumField label="Tanking slurry" suffix="£" step="0.5" value={rates.tankingSlurryPrice} onChange={(n) => setRates({ tankingSlurryPrice: n })} />
              <NumField label="Trim length" suffix="£" step="0.5" value={rates.trimPrice} onChange={(n) => setRates({ trimPrice: n })} />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl">Coverage</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumField label="Adhesive bag size" suffix="kg" step="1" value={rates.adhesiveBagKg} onChange={(n) => setRates({ adhesiveBagKg: n })} />
              <NumField label="Grout bag size" suffix="kg" step="1" value={rates.groutBagKg} onChange={(n) => setRates({ groutBagKg: n })} />
              <NumField label="Primer coverage" suffix="m²/pack" step="0.5" value={rates.primerCoverageM2} onChange={(n) => setRates({ primerCoverageM2: n })} />
              <NumField label="Leveller coverage" suffix="m²/bag" step="0.5" value={rates.levellerCoverageM2} onChange={(n) => setRates({ levellerCoverageM2: n })} />
              <NumField label="Tanking coverage" suffix="m²/tub" step="0.5" value={rates.tankingCoverageM2} onChange={(n) => setRates({ tankingCoverageM2: n })} />
              <NumField label="Silicone coverage" suffix="m/tube" step="0.5" value={rates.siliconeMetresPerTube} onChange={(n) => setRates({ siliconeMetresPerTube: n })} />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-border)]">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-2xl">Update Centre</h2><p className="mt-1 text-sm text-muted-foreground">TileMate checks online no more often than every 28 days. The feed can carry current VAT, market/material data and guidance updates.</p></div><Button onClick={() => void checkNow()} disabled={checking}>{checking ? <RefreshCw className="animate-spin" /> : <RefreshCw />} Check now</Button></div>
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">Status</p><p className="mt-1 font-semibold">{updateMeta.sourceStatus}</p></div>
              <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">Last checked</p><p className="mt-1 font-semibold">{updateMeta.lastCheckedAt ? new Date(updateMeta.lastCheckedAt).toLocaleString("en-GB") : "Never"}</p></div>
              <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">Feed</p><p className="mt-1 break-all font-semibold">{business.updateFeedUrl}</p></div>
            </div>
            {message ? <p className="rounded-xl bg-accent p-3 text-sm">{message}</p> : null}
            <div className="grid gap-2 sm:grid-cols-2">
              {OFFICIAL_SOURCES.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="rounded-xl border border-border p-3 hover:bg-muted"><div className="flex items-center justify-between gap-3"><span className="font-semibold">{source.title}</span><ExternalLink className="size-4 shrink-0" /></div><p className="mt-1 text-xs text-muted-foreground">{source.note}</p></a>)}
            </div>
            <Field label="Custom update feed URL"><Input value={business.updateFeedUrl} onChange={(e) => setBusiness({ updateFeedUrl: e.target.value })} /></Field>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl">Payment details</h2>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Bank"><Input value={business.bankName} onChange={(e) => setBusiness({ bankName: e.target.value })} /></Field><Field label="Sort code"><Input value={business.bankSort} onChange={(e) => setBusiness({ bankSort: e.target.value })} /></Field><Field label="Account number" className="sm:col-span-2"><Input value={business.bankAccount} onChange={(e) => setBusiness({ bankAccount: e.target.value })} /></Field></div>
          </section>

          <section className="space-y-4"><h2 className="font-display text-2xl">Terms</h2><NumField label="Quote valid for" suffix="days" step="1" value={business.quoteValidityDays} onChange={(n) => setBusiness({ quoteValidityDays: n })} /><Field label="Terms and conditions"><Textarea className="min-h-56" value={business.terms} onChange={(e) => setBusiness({ terms: e.target.value })} /></Field><Field label="Insurance note"><Input value={business.insuranceNote} onChange={(e) => setBusiness({ insuranceNote: e.target.value })} /></Field></section>
        </div> : null}
      </main>
    </AppShell>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) { return <label className={`flex flex-col gap-1.5 ${className ?? ""}`}><span className="text-sm font-medium">{label}</span>{children}</label>; }
