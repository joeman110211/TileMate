import { areaBreakdown, tileCount } from "@/lib/tiling/calc";
import { labourFor, quoteTotals } from "@/lib/tiling/labour";
import { materialsFor } from "@/lib/tiling/materials";
import type { Job, Rates } from "@/lib/tiling/types";
import { gbp, m2, qty } from "@/lib/format";

export function TotalsPanel({ job, rates, compact }: { job: Job; rates: Rates; compact?: boolean }) {
  const area = areaBreakdown(job);
  const tiles = tileCount(job);
  const labour = labourFor(job, rates);
  const quote = quoteTotals(job, rates);
  const mats = materialsFor(job, rates);

  return (
    <aside className="rounded-xl bg-sidebar p-5 text-sidebar-foreground">
      <p className="text-xs font-medium tracking-wide text-sidebar-muted uppercase">Live take-off</p>
      <dl className="mt-4 space-y-3">
        <Row k="Gross area" v={m2(area.gross)} />
        <Row k="Windows, doors & openings" v={`− ${m2(area.openings)}`} muted />
        <Row k="Net area to tile" v={m2(area.net)} strong />
        <Row
          k={`Waste ${area.effectiveWastePct}%${area.patternExtraPct ? " (incl. pattern)" : ""}`}
          v={m2(area.wasteM2)}
        />
        <Row k="Order area" v={m2(area.orderM2)} strong />
        <div className="h-px bg-sidebar-foreground/10" />
        <Row k="Tiles to order" v={`${qty(tiles.recommended)} tiles`} strong />
        <Row k="Layout count (before extra waste)" v={`${qty(tiles.layoutTiles)}`} muted />
        {!compact ? (
          <>
            <Row k="Adhesive" v={`${mats.find((m) => m.id === "adhesive")?.qty ?? 0} bags`} />
            <Row k="Grout" v={`${mats.find((m) => m.id === "grout")?.qty ?? 0} bags`} />
            <Row k="Silicone" v={`${mats.find((m) => m.id === "silicone")?.qty ?? 0} tubes`} />
            <Row k="Labour" v={`${labour.days} day${labour.days === 1 ? "" : "s"}`} />
            <div className="h-px bg-sidebar-foreground/10" />
            <Row k="Materials" v={gbp(quote.materials)} />
            <Row k="Labour" v={gbp(quote.labour)} />
            {quote.tiles > 0 ? <Row k="Tiles (supply)" v={gbp(quote.tiles)} /> : null}
            {quote.extras > 0 ? <Row k="Extras" v={gbp(quote.extras)} /> : null}
            {quote.vatPct > 0 ? <Row k={`VAT ${quote.vatPct}%`} v={gbp(quote.vat)} /> : <Row k="VAT" v="Not charged" muted />}
          </>
        ) : null}
        <Row k="Quote total" v={gbp(quote.gross)} strong big />
        <Row k={`Deposit ${quote.depositPct}%`} v={gbp(quote.deposit)} />
      </dl>
    </aside>
  );
}

function Row({
  k,
  v,
  strong,
  muted,
  big,
}: {
  k: string;
  v: string;
  strong?: boolean;
  muted?: boolean;
  big?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={muted ? "text-sm text-sidebar-muted" : "text-sm text-sidebar-foreground/80"}>{k}</dt>
      <dd
        className={
          big
            ? "font-display text-2xl tabular-nums tracking-tight"
            : strong
              ? "text-sm font-semibold tabular-nums"
              : "text-sm tabular-nums text-sidebar-foreground/90"
        }
      >
        {v}
      </dd>
    </div>
  );
}
