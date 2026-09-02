import { Plus, Trash2 } from "lucide-react";
import { NumField } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { surfaceGrossM2, surfaceNetM2, surfaceOpeningsM2 } from "@/lib/tiling/calc";
import { makeSurface } from "@/lib/tiling/defaults";
import type { Job, Opening, OpeningKind, Surface, SurfaceKind } from "@/lib/tiling/types";
import { OPENING_KINDS, SURFACE_KINDS } from "@/lib/tiling/types";
import { m2 } from "@/lib/format";
import { uid } from "@/lib/utils";

const KIND_LABEL: Record<SurfaceKind, string> = {
  wall: "Wall",
  floor: "Floor",
  splashback: "Splashback",
  ceiling: "Ceiling",
};

const OPENING_LABEL: Record<OpeningKind, string> = {
  window: "Window",
  door: "Door",
  niche: "Niche / opening",
  bath: "Bath / tray (not tiled)",
  other: "Other deduction",
};

export function SurfaceEditor({
  job,
  onChange,
}: {
  job: Job;
  onChange: (surfaces: Surface[]) => void;
}) {
  const add = (kind: SurfaceKind) => {
    const n = job.surfaces.filter((s) => s.kind === kind).length + 1;
    const name =
      kind === "wall" ? `Wall ${n}` : kind === "floor" ? (n === 1 ? "Floor" : `Floor ${n}`) : `${KIND_LABEL[kind]} ${n}`;
    onChange([...job.surfaces, makeSurface({ name, kind, heightM: kind === "wall" ? 2.4 : 0 })]);
  };

  const addRoom = () => {
    const room = [
      makeSurface({ name: "Wall 1", kind: "wall", heightM: 2.4 }),
      makeSurface({ name: "Wall 2", kind: "wall", heightM: 2.4 }),
      makeSurface({ name: "Wall 3", kind: "wall", heightM: 2.4 }),
      makeSurface({ name: "Wall 4", kind: "wall", heightM: 2.4 }),
      makeSurface({ name: "Floor", kind: "floor" }),
    ];
    onChange([...job.surfaces, ...room]);
  };

  const patch = (id: string, next: Partial<Surface>) =>
    onChange(job.surfaces.map((s) => (s.id === id ? { ...s, ...next } : s)));

  const patchOpening = (surfaceId: string, openingId: string, next: Partial<Opening>) =>
    onChange(
      job.surfaces.map((s) =>
        s.id !== surfaceId
          ? s
          : { ...s, openings: s.openings.map((o) => (o.id === openingId ? { ...o, ...next } : o)) },
      ),
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => add("wall")}>
          <Plus /> Wall
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => add("floor")}>
          <Plus /> Floor
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => add("splashback")}>
          <Plus /> Splashback
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={addRoom}>
          Add 4 walls + floor
        </Button>
      </div>

      {job.surfaces.length === 0 ? (
        <p className="rounded-lg bg-muted px-4 py-6 text-sm text-muted-foreground">
          Add a wall or floor, then punch in the height and width. Deduct windows and doors on each surface so the net
          area is the true area to tile.
        </p>
      ) : null}

      <div className="space-y-4">
        {job.surfaces.map((s) => {
          const dimLabel = s.kind === "floor" ? "Length" : "Height";
          return (
            <article key={s.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Input value={s.name} onChange={(e) => patch(s.id, { name: e.target.value })} className="h-10 font-medium" />
                  <Select value={s.kind} onValueChange={(v) => patch(s.id, { kind: v as SurfaceKind })}>
                    <SelectTrigger className="h-10 w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SURFACE_KINDS.map((k) => (
                        <SelectItem key={k} value={k}>
                          {KIND_LABEL[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Remove surface"
                  onClick={() => onChange(job.surfaces.filter((x) => x.id !== s.id))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <NumField label="Width" suffix="m" value={s.widthM} onChange={(n) => patch(s.id, { widthM: n })} />
                <NumField label={dimLabel} suffix="m" value={s.heightM} onChange={(n) => patch(s.id, { heightM: n })} />
                <div className="rounded-md bg-muted px-3 py-2">
                  <p className="text-xs text-muted-foreground">Gross</p>
                  <p className="tabular-nums text-sm font-medium">{m2(surfaceGrossM2(s))}</p>
                </div>
                <div className="rounded-md bg-accent px-3 py-2">
                  <p className="text-xs text-accent-foreground">Net to tile</p>
                  <p className="tabular-nums text-sm font-medium">{m2(surfaceNetM2(s))}</p>
                </div>
              </div>

              {s.openings.length > 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Deductions {m2(surfaceOpeningsM2(s))} · {s.openings.length} opening{s.openings.length === 1 ? "" : "s"}
                </p>
              ) : null}

              <div className="mt-4 space-y-3">
                {s.openings.map((o) => (
                  <div key={o.id} className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-3 sm:grid-cols-5">
                    <Input
                      value={o.name}
                      onChange={(e) => patchOpening(s.id, o.id, { name: e.target.value })}
                      className="col-span-2 h-10 sm:col-span-1"
                    />
                    <Select
                      value={o.kind}
                      onValueChange={(v) => patchOpening(s.id, o.id, { kind: v as OpeningKind })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPENING_KINDS.map((k) => (
                          <SelectItem key={k} value={k}>
                            {OPENING_LABEL[k]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <NumField
                      label="Width"
                      suffix="m"
                      value={o.widthM}
                      onChange={(n) => patchOpening(s.id, o.id, { widthM: n })}
                    />
                    <NumField
                      label="Height"
                      suffix="m"
                      value={o.heightM}
                      onChange={(n) => patchOpening(s.id, o.id, { heightM: n })}
                    />
                    <div className="col-span-2 flex items-end justify-between sm:col-span-5">
                      <p className="text-xs text-muted-foreground">Deducts {m2(o.widthM * o.heightM)}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          patch(s.id, { openings: s.openings.filter((x) => x.id !== o.id) })
                        }
                      >
                        <Trash2 className="size-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    patch(s.id, {
                      openings: [
                        ...s.openings,
                        { id: uid("op"), kind: "window", name: "Window", widthM: 0.9, heightM: 1.2 },
                      ],
                    })
                  }
                >
                  <Plus /> Deduct window / door
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
