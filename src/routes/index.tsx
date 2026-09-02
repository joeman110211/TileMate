import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { areaBreakdown } from "@/lib/tiling/calc";
import { quoteTotals } from "@/lib/tiling/labour";
import { JOB_TYPE_LABEL, JOB_TYPES, type JobType } from "@/lib/tiling/types";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatDate, gbp, m2 } from "@/lib/format";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hydrated = useHydrated();
  const jobs = useStore((s) => s.jobs);
  const rates = useStore((s) => s.rates);
  const addJob = useStore((s) => s.addJob);
  const removeJob = useStore((s) => s.removeJob);
  const duplicateJob = useStore((s) => s.duplicateJob);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [jobType, setJobType] = useState<JobType>("bathroom_walls");

  const create = () => {
    const job = addJob({
      name: name.trim() || "New job",
      customer: { name: customer.trim(), email: "", phone: "", address: "" },
      jobType,
    });
    setOpen(false);
    setName("");
    setCustomer("");
    void navigate({ to: "/job/$jobId", params: { jobId: job.id } });
  };

  const live = jobs.filter((j) => !["paid", "declined"].includes(j.status));
  const outstanding = jobs
    .filter((j) => j.status === "invoiced")
    .reduce((s, j) => s + quoteTotals(j, rates).gross, 0);

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl tracking-tight">Jobs</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Punch in walls and floors, deduct windows and doors, then get tiles, bags, labour and a quote you can send.
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus /> New job
          </Button>
        </div>

        {hydrated ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="Open jobs" value={String(live.length)} />
            <Stat label="Quoted" value={String(jobs.filter((j) => j.status === "quoted" || j.status === "accepted").length)} />
            <Stat label="Outstanding invoices" value={gbp(outstanding, 0)} />
          </div>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="h-24 rounded-xl bg-muted" />
            <div className="h-24 rounded-xl bg-muted" />
            <div className="h-24 rounded-xl bg-muted" />
          </div>
        )}

        <ul className="mt-8 space-y-3">
          {!hydrated ? (
            <li className="h-28 rounded-xl bg-muted" />
          ) : jobs.length === 0 ? (
            <li className="rounded-xl bg-card px-5 py-10 text-center shadow-[var(--shadow-border)]">
              <p className="font-display text-xl">No jobs yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create a job and start with Wall 1.</p>
              <Button className="mt-4" onClick={() => setOpen(true)}>
                <Plus /> New job
              </Button>
            </li>
          ) : (
            jobs.map((job) => {
              const area = areaBreakdown(job);
              const tot = quoteTotals(job, rates);
              return (
                <li key={job.id}>
                  <Link
                    to="/job/$jobId"
                    params={{ jobId: job.id }}
                    className="block rounded-xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-md sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-xl">{job.name}</h2>
                          <StatusBadge status={job.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {job.customer.name || "No customer"} · {JOB_TYPE_LABEL[job.jobType]} · {formatDate(job.updatedAt)}
                        </p>
                      </div>
                      <p className="font-display text-2xl tabular-nums">{gbp(tot.gross, 0)}</p>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Gross {m2(area.gross)} · openings {m2(area.openings)} · net {m2(area.net)} · order {m2(area.orderM2)}
                    </p>
                  </Link>
                  <div className="mt-1 flex justify-end gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const copy = duplicateJob(job.id);
                        if (copy) void navigate({ to: "/job/$jobId", params: { jobId: copy.id } });
                      }}
                    >
                      <Copy className="size-3.5" /> Duplicate
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => { if (window.confirm(`Delete "${job.name}"? This cannot be undone.`)) removeJob(job.id); }}>
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New job</DialogTitle>
            <DialogDescription>Give it a site name. You can add walls on the next screen.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Job name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 12 Oak Avenue bathroom" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Customer</span>
              <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Optional" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Type</span>
              <Select value={jobType} onValueChange={(v) => setJobType(v as JobType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {JOB_TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <Button className="w-full" onClick={create}>
              Open job
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-border)]">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-display text-3xl tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
