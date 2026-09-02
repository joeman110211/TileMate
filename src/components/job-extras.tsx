import { Plus, Trash2 } from "lucide-react";
import { NumField } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ExtraLine, Job, Waterproofing } from "@/lib/tiling/types";
import { uid } from "@/lib/utils";

const EXTRA_PRESETS: Omit<ExtraLine, "id">[] = [
  { label: "Strip existing tiles", qty: 1, unit: "m²", unitPrice: 12, notes: "" },
  { label: "Remove sanitaryware", qty: 1, unit: "item", unitPrice: 45, notes: "" },
  { label: "Tile-backer board", qty: 1, unit: "m²", unitPrice: 28, notes: "" },
  { label: "Niches (build and tile)", qty: 1, unit: "item", unitPrice: 95, notes: "" },
  { label: "Mitred external corners", qty: 1, unit: "lin m", unitPrice: 18, notes: "" },
  { label: "Underfloor heating prep", qty: 1, unit: "m²", unitPrice: 15, notes: "" },
  { label: "Skip / waste", qty: 1, unit: "item", unitPrice: 180, notes: "" },
];

export function JobExtras({ job, onChange }: { job: Job; onChange: (job: Job) => void }) {
  const add = (preset?: Omit<ExtraLine, "id">) => {
    const line: ExtraLine = {
      id: uid("ex"),
      label: preset?.label ?? "Extra work",
      qty: preset?.qty ?? 1,
      unit: preset?.unit ?? "item",
      unitPrice: preset?.unitPrice ?? 0,
      notes: preset?.notes ?? "",
    };
    onChange({ ...job, extras: [...job.extras, line] });
  };

  const patch = (id: string, next: Partial<ExtraLine>) =>
    onChange({ ...job, extras: job.extras.map((e) => (e.id === id ? { ...e, ...next } : e)) });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {EXTRA_PRESETS.map((p) => (
          <Button key={p.label} type="button" size="sm" variant="secondary" onClick={() => add(p)}>
            <Plus /> {p.label}
          </Button>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={() => add()}>
          <Plus /> Custom line
        </Button>
      </div>
      {job.extras.length === 0 ? (
        <p className="text-sm text-muted-foreground">No extras yet. Use these for stripping, boarding, niches and waste.</p>
      ) : null}
      <div className="space-y-3">
        {job.extras.map((e) => (
          <div key={e.id} className="grid gap-2 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:grid-cols-4">
            <Input className="sm:col-span-2" value={e.label} onChange={(ev) => patch(e.id, { label: ev.target.value })} />
            <NumField label="Qty" step="0.1" value={e.qty} onChange={(n) => patch(e.id, { qty: n })} />
            <NumField label="Unit price £" step="0.5" value={e.unitPrice} onChange={(n) => patch(e.id, { unitPrice: n })} />
            <Input value={e.unit} onChange={(ev) => patch(e.id, { unit: ev.target.value })} />
            <div className="sm:col-span-3 flex items-end">
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange({ ...job, extras: job.extras.filter((x) => x.id !== e.id) })}>
                <Trash2 className="size-3.5" /> Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WaterproofingForm({ job, onChange }: { job: Job; onChange: (job: Job) => void }) {
  const w = job.waterproofing;
  const set = (patch: Partial<Waterproofing>) => onChange({ ...job, waterproofing: { ...w, ...patch } });

  const applyPreset = (preset: Waterproofing["preset"]) => {
    const walls = job.surfaces.filter((s) => s.kind === "wall");
    const floors = job.surfaces.filter((s) => s.kind === "floor");
    const wallArea = walls.reduce((a, s) => a + s.widthM * Math.min(s.heightM, 2), 0);
    const floorArea = floors.reduce((a, s) => a + s.widthM * s.heightM, 0);
    if (preset === "none") set({ enabled: false, preset, wallM2: 0, floorM2: 0 });
    else if (preset === "shower")
      set({
        enabled: true,
        preset,
        wallM2: Math.max(4, Number((Math.min(wallArea, 8)).toFixed(2))),
        floorM2: 1.6,
        notes: "Tank shower enclosure walls to ~2 m and the tray floor, including corners and pipe collars.",
      });
    else if (preset === "wet_room")
      set({
        enabled: true,
        preset,
        wallM2: Number(wallArea.toFixed(2)),
        floorM2: Number(floorArea.toFixed(2)),
        notes: "Full wet-room tanking: entire floor, upstands, and shower walls to full height.",
      });
    else set({ enabled: true, preset });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
        <div>
          <p className="font-medium">Waterproofing / tanking</p>
          <p className="text-sm text-muted-foreground">Tile is not a tanking system. Quote the wet zone properly.</p>
        </div>
        <Switch checked={w.enabled} onCheckedChange={(v) => set({ enabled: v, preset: v ? w.preset : "none" })} />
      </div>
      <div className="flex flex-wrap gap-2">
        {(["none", "shower", "wet_room", "custom"] as const).map((p) => (
          <Button key={p} type="button" size="sm" variant={w.preset === p ? "default" : "secondary"} onClick={() => applyPreset(p)}>
            {p === "none" ? "None" : p === "shower" ? "Shower enclosure" : p === "wet_room" ? "Wet room" : "Custom"}
          </Button>
        ))}
      </div>
      {w.enabled ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumField label="Tanked walls" suffix="m²" value={w.wallM2} onChange={(n) => set({ wallM2: n })} />
          <NumField label="Tanked floor" suffix="m²" value={w.floorM2} onChange={(n) => set({ floorM2: n })} />
          <div className="sm:col-span-2">
            <Textarea value={w.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Notes for the quote" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CustomerForm({ job, onChange }: { job: Job; onChange: (job: Job) => void }) {
  const c = job.customer;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Customer</span>
        <Input value={c.name} onChange={(e) => onChange({ ...job, customer: { ...c, name: e.target.value } })} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Phone</span>
        <Input value={c.phone} onChange={(e) => onChange({ ...job, customer: { ...c, phone: e.target.value } })} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Email</span>
        <Input type="email" value={c.email} onChange={(e) => onChange({ ...job, customer: { ...c, email: e.target.value } })} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Job type</span>
        <Select value={job.jobType} onValueChange={(v) => onChange({ ...job, jobType: v as Job["jobType"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(
              {
                bathroom_walls: "Bathroom walls",
                bathroom_floor: "Bathroom floor",
                bathroom_refit: "Bathroom refit",
                wet_room: "Wet room",
                kitchen_splashback: "Kitchen splashback",
                kitchen_floor: "Kitchen floor",
                utility: "Utility / cloakroom",
                hallway_floor: "Hallway / floor",
                other: "Other",
              } as const,
            ).map(([k, lab]) => (
              <SelectItem key={k} value={k}>
                {lab}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="sm:col-span-2 flex flex-col gap-1.5">
        <span className="text-sm font-medium">Site address</span>
        <Input value={job.siteAddress} onChange={(e) => onChange({ ...job, siteAddress: e.target.value })} />
      </label>
      <label className="sm:col-span-2 flex flex-col gap-1.5">
        <span className="text-sm font-medium">Customer address</span>
        <Input value={c.address} onChange={(e) => onChange({ ...job, customer: { ...c, address: e.target.value } })} />
      </label>
    </div>
  );
}
