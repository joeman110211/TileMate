import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CustomerForm, JobExtras, WaterproofingForm } from "@/components/job-extras";
import { DocumentsPanel } from "@/components/documents-panel";
import { LayoutPreview } from "@/components/layout-preview";
import { MaterialsList } from "@/components/materials-list";
import { PhotoTools, ScaleMeasure } from "@/components/photo-tools";
import { QuoteDocument, type DocKind } from "@/components/quote-document";
import { StatusBadge } from "@/components/status-badge";
import { SurfaceEditor } from "@/components/surface-editor";
import { TileSpecForm } from "@/components/tile-spec-form";
import { TotalsPanel } from "@/components/totals-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { areaBreakdown } from "@/lib/tiling/calc";
import { primaryAdvice } from "@/lib/tiling/layout";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { m2 } from "@/lib/format";
import type { Job } from "@/lib/tiling/types";

const DOCS = new Set<DocKind>(["quote", "booking", "invoice", "receipt"]);

export const Route = createFileRoute("/job/$jobId")({
  validateSearch: (s: Record<string, unknown>): { doc?: DocKind } => {
    const doc = s.doc;
    if (typeof doc === "string" && DOCS.has(doc as DocKind)) return { doc: doc as DocKind };
    return {};
  },
  component: JobPage,
});

function JobPage() {
  const { jobId } = Route.useParams();
  const { doc } = Route.useSearch();
  const hydrated = useHydrated();
  const job = useStore((s) => s.jobs.find((j) => j.id === jobId));
  const rates = useStore((s) => s.rates);
  const business = useStore((s) => s.business);
  const updateJob = useStore((s) => s.updateJob);
  const assignQuoteNo = useStore((s) => s.assignQuoteNo);
  const assignInvoiceNo = useStore((s) => s.assignInvoiceNo);

  const save = (next: Job) => updateJob(jobId, next);

  if (!hydrated) {
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-10 w-48 rounded-md bg-muted" />
          <div className="mt-6 h-64 rounded-xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell>
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="font-display text-3xl">Job not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">It may have been deleted on this device.</p>
          <Button asChild className="mt-6">
            <Link to="/">Back to jobs</Link>
          </Button>
        </main>
      </AppShell>
    );
  }

  if (doc) {
    return (
      <div className="min-h-dvh bg-background pb-16">
        <div className="no-print mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <Button asChild variant="ghost">
            <Link to="/job/$jobId" params={{ jobId }}>
              <ArrowLeft /> Back to job
            </Link>
          </Button>
          <Button type="button" onClick={() => window.print()}>
            Print / save PDF
          </Button>
        </div>
        <QuoteDocument job={job} rates={rates} business={business} kind={doc} />
      </div>
    );
  }

  const area = areaBreakdown(job);

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> Jobs
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                value={job.name}
                onChange={(e) => save({ ...job, name: e.target.value })}
                className="font-display w-full max-w-xl bg-transparent text-3xl tracking-tight outline-none sm:text-4xl"
              />
              <StatusBadge status={job.status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Gross {m2(area.gross)} · openings {m2(area.openings)} · net {m2(area.net)} · +{area.effectiveWastePct}% ={" "}
              {m2(area.orderM2)} to order
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Tabs defaultValue="measure">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="job">Job</TabsTrigger>
              <TabsTrigger value="measure">Measure</TabsTrigger>
              <TabsTrigger value="tiles">Tiles</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="kit">Materials</TabsTrigger>
              <TabsTrigger value="quote">Quote</TabsTrigger>
              <TabsTrigger value="site">Site</TabsTrigger>
            </TabsList>

            <TabsContent value="job" className="space-y-4">
              <CustomerForm job={job} onChange={save} />
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Notes on the quote</span>
                <Textarea value={job.notes} onChange={(e) => save({ ...job, notes: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Private notes</span>
                <Textarea
                  value={job.internalNotes}
                  onChange={(e) => save({ ...job, internalNotes: e.target.value })}
                  placeholder="Parking, keys, pets — not printed"
                />
              </label>
            </TabsContent>

            <TabsContent value="measure" className="space-y-6">
              <SurfaceEditor job={job} onChange={(surfaces) => save({ ...job, surfaces })} />
              <ScaleMeasure
                onApply={(metres) => {
                  const target = job.surfaces.find((s) => s.widthM === 0) ?? job.surfaces[0];
                  if (!target) return;
                  save({
                    ...job,
                    surfaces: job.surfaces.map((s) => (s.id === target.id ? { ...s, widthM: metres } : s)),
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="tiles">
              <TileSpecForm job={job} onChange={save} />
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <p className="rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">{primaryAdvice(job)}</p>
              <LayoutPreview job={job} />
            </TabsContent>

            <TabsContent value="kit" className="space-y-8">
              <MaterialsList job={job} rates={rates} />
              <WaterproofingForm job={job} onChange={save} />
              <div>
                <h2 className="font-display text-xl">Extras</h2>
                <p className="mt-1 mb-3 text-sm text-muted-foreground">Stripping, boarding, niches, waste and anything else.</p>
                <JobExtras job={job} onChange={save} />
              </div>
            </TabsContent>

            <TabsContent value="quote">
              <DocumentsPanel
                job={job}
                rates={rates}
                business={business}
                onChange={save}
                assignQuoteNo={() => assignQuoteNo(job.id)}
                assignInvoiceNo={() => assignInvoiceNo(job.id)}
              />
            </TabsContent>

            <TabsContent value="site">
              <PhotoTools job={job} onChange={(photos) => save({ ...job, photos })} />
            </TabsContent>
          </Tabs>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <TotalsPanel job={job} rates={rates} />
          </div>
        </div>
      </main>
    </AppShell>
  );
}
