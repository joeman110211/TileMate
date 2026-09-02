import { labourFor } from "@/lib/tiling/labour";
import { materialsFor } from "@/lib/tiling/materials";
import type { Job, Rates } from "@/lib/tiling/types";
import { gbp } from "@/lib/format";

export function MaterialsList({ job, rates }: { job: Job; rates: Rates }) {
  const lines = materialsFor(job, rates);
  const labour = labourFor(job, rates);
  if (lines.length === 0) {
    return <p className="text-sm text-muted-foreground">Add area first and the bags will calculate themselves.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground">
        <p className="font-medium">{labour.sizeLabel}</p>
        <p className="mt-1 text-accent-foreground/80">
          About {labour.totalHours.toFixed(1)} hours on site ({labour.days} day
          {labour.days === 1 ? "" : "s"} at {rates.hoursPerDay} h/day), including prep
          {labour.waterproofHours > 0 ? " and tanking" : ""}.
        </p>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
        {lines.map((l) => (
          <li key={l.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="font-medium">
                {l.name}
                {l.optional ? <span className="ml-2 text-xs font-normal text-muted-foreground">optional</span> : null}
              </p>
              <p className="text-sm text-muted-foreground">{l.detail}</p>
            </div>
            <p className="shrink-0 tabular-nums text-sm font-medium">
              {l.qty} {l.unit} · {gbp(l.total)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
