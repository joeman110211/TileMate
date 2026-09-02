import { layoutJob, type AxisPlan } from "@/lib/tiling/layout";
import type { Job } from "@/lib/tiling/types";
import { mm } from "@/lib/format";

export function LayoutPreview({ job }: { job: Job }) {
  const layouts = layoutJob(job);
  if (layouts.length === 0) {
    return <p className="text-sm text-muted-foreground">Add surfaces with sizes to see a starting line.</p>;
  }

  return (
    <div className="space-y-6">
      {layouts.map((l) => (
        <article key={l.surfaceId} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
          <h3 className="font-display text-lg">{l.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{l.summary}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <AxisCard title={l.kind === "floor" ? "Width" : "Along the wall"} plan={l.width} />
            <AxisCard title={l.kind === "floor" ? "Length" : "Up the wall"} plan={l.height} />
          </div>
          {l.width.warning || l.height.warning ? (
            <p className="mt-3 rounded-md bg-secondary px-3 py-2 text-sm text-warn">
              {l.width.warning ?? l.height.warning}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function AxisCard({ title, plan }: { title: string; plan: AxisPlan }) {
  const w = 640;
  const h = 72;
  const scale = plan.lengthM > 0 ? (w - 8) / plan.lengthM : 1;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">
          {plan.fullCount} full · {plan.cutCount} cut · start {mm(plan.startOffsetM * 1000)}
        </p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full rounded-md bg-muted" role="img" aria-label={title}>
        {plan.tiles.map((t, i) => {
          const x = 4 + t.x * scale;
          const tw = Math.max(2, t.w * scale - 1.5);
          return (
            <g key={i}>
              <rect
                x={x}
                y={14}
                width={tw}
                height={44}
                rx={3}
                className={t.sliver ? "fill-destructive/80" : t.cut ? "fill-primary/55" : "fill-primary"}
              />
              {tw > 28 ? (
                <text x={x + tw / 2} y={40} textAnchor="middle" className="fill-primary-foreground" fontSize="11">
                  {Math.round(t.w * 1000)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-xs text-muted-foreground">{plan.advice}</p>
    </div>
  );
}
