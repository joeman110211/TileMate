import { ExternalLink } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

export function QrCode({ value, label = "Scan to view profile" }: { value: string; label?: string }) {
  const src = useMemo(() => `https://quickchart.io/qr?text=${encodeURIComponent(value)}&size=320&margin=2`, [value]);
  return (
    <div className="rounded-xl border border-border bg-white p-4 text-center shadow-[var(--shadow-border)]">
      <img src={src} alt={label} className="mx-auto aspect-square w-56 rounded-md" />
      <p className="mt-2 text-sm font-semibold">{label}</p>
      <p className="mt-1 break-all text-[11px] text-muted-foreground">{value}</p>
      <Button className="mt-3" size="sm" variant="outline" asChild>
        <a href={value} target="_blank" rel="noreferrer">
          Open profile <ExternalLink />
        </a>
      </Button>
    </div>
  );
}
