import { Camera, Ruler, Sparkles } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyseSitePhoto } from "@/lib/ai-advice";
import type { Job, PhotoNote } from "@/lib/tiling/types";
import { uid } from "@/lib/utils";

async function fileToDataUrl(file: File, max = 1280): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function PhotoTools({ job, onChange }: { job: Job; onChange: (photos: PhotoNote[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const next = [...job.photos];
    for (const file of Array.from(files)) {
      const dataUrl = await fileToDataUrl(file);
      next.unshift({
        id: uid("ph"),
        dataUrl,
        caption: file.name,
        advice: "",
        createdAt: Date.now(),
      });
    }
    onChange(next);
  };

  const advise = async (photo: PhotoNote) => {
    setBusy(true);
    setError(null);
    try {
      const result = await analyseSitePhoto({
        data: {
          imageDataUrl: photo.dataUrl,
          notes,
          jobContext: `${job.name}. ${job.jobType}. ${job.tile.name}, ${job.tile.widthMm}×${job.tile.heightMm} mm, ${job.tile.spacerMm} mm joint.`,
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onChange(job.photos.map((p) => (p.id === photo.id ? { ...p, advice: result.text } : p)));
    } catch {
      setError("Could not reach the advice service. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Photograph walls, floors, wastes and problem areas. Get a second pair of eyes on the substrate, tanking and
        cuts. True laser measuring is not available in the browser — use the scale tool on the Measure tab for a
        known-size object, or punch in tape measurements.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button type="button" onClick={() => inputRef.current?.click()}>
          <Camera /> Add site photo
        </Button>
      </div>
      <Textarea
        placeholder="Optional notes for the advice (e.g. this is the shower wall, plaster is dusty)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {job.photos.length === 0 ? (
        <p className="rounded-lg bg-muted px-4 py-6 text-sm text-muted-foreground">No photos on this job yet.</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {job.photos.map((p) => (
          <figure key={p.id} className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
            <img src={p.dataUrl} alt={p.caption} className="h-52 w-full object-cover outline outline-1 -outline-offset-1 outline-foreground/10" />
            <figcaption className="space-y-3 p-4">
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={busy} onClick={() => void advise(p)}>
                  <Sparkles /> {busy ? "Reading…" : "Advise from photo"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onChange(job.photos.filter((x) => x.id !== p.id))}
                >
                  Remove
                </Button>
              </div>
              {p.advice ? (
                <div className="text-sm whitespace-pre-line text-foreground">{p.advice}</div>
              ) : (
                <p className="text-xs text-muted-foreground">No advice stored yet.</p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

type Point = { x: number; y: number };

export function ScaleMeasure({ onApply }: { onApply: (metres: number) => void }) {
  const [src, setSrc] = useState<string | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [refMm, setRefMm] = useState(300);
  const imgRef = useRef<HTMLImageElement>(null);

  const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

  const metres = (() => {
    if (points.length < 4 || !src) return 0;
    const ref = dist(points[0], points[1]);
    const meas = dist(points[2], points[3]);
    if (ref < 2) return 0;
    return (meas / ref) * (refMm / 1000);
  })();

  const click = (e: MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!img) return;
    const r = img.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    setPoints((prev) => (prev.length >= 4 ? [p] : [...prev, p]));
  };

  return (
    <div className="space-y-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="flex items-center gap-2">
        <Ruler className="size-4" />
        <p className="font-medium">Scale a photo</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Tap two points on a known length (a tile, a spirit level, a door leaf), then two points on the run you want to
        measure. This is a scale, not a laser.
      </p>
      <label className="text-sm font-medium">
        Known length
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            className="h-11 w-28 rounded-md border border-border bg-card px-3"
            value={refMm}
            onChange={(e) => setRefMm(Number(e.target.value) || 0)}
          />
          <span className="text-sm text-muted-foreground">mm</span>
        </div>
      </label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setSrc(await fileToDataUrl(f, 1600));
          setPoints([]);
        }}
      />
      {src ? (
        <div className="relative">
          <img
            ref={imgRef}
            src={src}
            alt="Measure"
            className="w-full cursor-crosshair rounded-md outline outline-1 -outline-offset-1 outline-foreground/10"
            onClick={click}
          />
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={5} className="fill-primary" />
            ))}
            {points.length >= 2 ? (
              <line x1={points[0].x} y1={points[0].y} x2={points[1].x} y2={points[1].y} className="stroke-primary" strokeWidth={2} />
            ) : null}
            {points.length >= 4 ? (
              <line x1={points[2].x} y1={points[2].y} x2={points[3].x} y2={points[3].y} className="stroke-foreground" strokeWidth={2} />
            ) : null}
          </svg>
        </div>
      ) : null}
      <p className="text-sm">
        {points.length < 2
          ? "Step 1 — tap both ends of the known length."
          : points.length < 4
            ? "Step 2 — tap both ends of the wall or floor run."
            : `Measured run: ${metres.toFixed(2)} m`}
      </p>
      {metres > 0 ? (
        <Button type="button" size="sm" onClick={() => onApply(Number(metres.toFixed(2)))}>
          Use {metres.toFixed(2)} m
        </Button>
      ) : null}
    </div>
  );
}
