import { Field, NumField } from "@/components/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PATTERN_LABEL, PATTERNS, SPACER_PRESETS, TILE_PRESETS, type Job, type Pattern } from "@/lib/tiling/types";

export function TileSpecForm({ job, onChange }: { job: Job; onChange: (job: Job) => void }) {
  const t = job.tile;
  const set = (patch: Partial<Job["tile"]>) => onChange({ ...job, tile: { ...t, ...patch } });

  return (
    <div className="space-y-5">
      <Field label="Tile name">
        <Input value={t.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Matt porcelain 300 × 600" />
      </Field>

      <div>
        <p className="mb-2 text-sm font-medium">Common sizes</p>
        <div className="flex flex-wrap gap-2">
          {TILE_PRESETS.map((p) => {
            const active = t.widthMm === p.widthMm && t.heightMm === p.heightMm;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => set({ widthMm: p.widthMm, heightMm: p.heightMm, name: p.label })}
                className={
                  active
                    ? "h-10 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                    : "h-10 rounded-md bg-muted px-3 text-sm font-medium text-foreground"
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <NumField label="Width" suffix="mm" step="1" value={t.widthMm} onChange={(n) => set({ widthMm: n })} />
        <NumField label="Height" suffix="mm" step="1" value={t.heightMm} onChange={(n) => set({ heightMm: n })} />
        <NumField label="Thickness" suffix="mm" step="0.5" value={t.thicknessMm} onChange={(n) => set({ thicknessMm: n })} />
        <Field label="Also in cm">
          <p className="flex h-11 items-center rounded-md bg-muted px-3 text-sm tabular-nums">
            {(t.widthMm / 10).toFixed(1)} × {(t.heightMm / 10).toFixed(1)} cm
          </p>
        </Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Spacer / grout joint</p>
        <div className="flex flex-wrap gap-2">
          {SPACER_PRESETS.map((mm) => (
            <button
              key={mm}
              type="button"
              onClick={() => set({ spacerMm: mm })}
              className={
                t.spacerMm === mm
                  ? "h-10 min-w-12 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                  : "h-10 min-w-12 rounded-md bg-muted px-3 text-sm font-medium"
              }
            >
              {mm} mm
            </button>
          ))}
        </div>
        <div className="mt-3 max-w-40">
          <NumField label="Custom spacer" suffix="mm" step="0.5" value={t.spacerMm} onChange={(n) => set({ spacerMm: n })} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <NumField
          label="Waste for cuts"
          suffix="%"
          step="1"
          value={t.wastePct}
          onChange={(n) => set({ wastePct: n })}
        />
        <Field label="Pattern">
          <Select value={t.pattern} onValueChange={(v) => set({ pattern: v as Pattern })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PATTERNS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PATTERN_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">
        12% is the usual bathroom allowance. Herringbone and diagonal add extra waste automatically.
      </p>

      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
        <div>
          <p className="text-sm font-medium">Supply the tiles</p>
          <p className="text-xs text-muted-foreground">Turn off if the customer is supplying.</p>
        </div>
        <Switch checked={t.supplyTiles} onCheckedChange={(v) => set({ supplyTiles: v })} />
      </div>
      {t.supplyTiles ? (
        <NumField
          label="Tile price"
          suffix="£/m²"
          step="0.5"
          value={t.pricePerM2}
          onChange={(n) => set({ pricePerM2: n })}
        />
      ) : null}
    </div>
  );
}
