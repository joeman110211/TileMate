import { areaBreakdown, tileCount } from "@/lib/tiling/calc";
import { labourFor, quoteTotals } from "@/lib/tiling/labour";
import { materialsFor } from "@/lib/tiling/materials";
import type { Business, Job, Rates } from "@/lib/tiling/types";
import { JOB_TYPE_LABEL } from "@/lib/tiling/types";
import { formatDateLong, gbp, m2, qty } from "@/lib/format";

export type DocKind = "quote" | "booking" | "invoice" | "receipt";

const TITLE: Record<DocKind, string> = {
  quote: "Quotation",
  booking: "Booking confirmation & deposit request",
  invoice: "Invoice",
  receipt: "Payment receipt",
};

export function QuoteDocument({
  job,
  rates,
  business,
  kind,
}: {
  job: Job;
  rates: Rates;
  business: Business;
  kind: DocKind;
}) {
  const area = areaBreakdown(job);
  const tiles = tileCount(job);
  const mats = materialsFor(job, rates);
  const labour = labourFor(job, rates);
  const tot = quoteTotals(job, rates);
  const issued = kind === "invoice" ? job.docs.invoicedAt : kind === "receipt" ? job.docs.paidAt : job.docs.quoteSentAt;
  const number =
    kind === "invoice" || kind === "receipt" ? job.docs.invoiceNo || "—" : job.docs.quoteNo || "—";

  return (
    <article className="print-sheet mx-auto max-w-3xl bg-card px-6 py-8 text-card-foreground shadow-[var(--shadow-border)] sm:px-10 sm:py-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-display text-3xl tracking-tight">{business.name || "TileMate"}</p>
          {business.owner ? <p className="mt-1 text-sm">{business.owner}</p> : null}
          <p className="mt-2 max-w-xs text-sm text-muted-foreground whitespace-pre-line">
            {[business.address, business.phone, business.email, business.vatNumber ? `VAT ${business.vatNumber}` : ""]
              .filter(Boolean)
              .join("\n")}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl">{TITLE[kind]}</p>
          <p className="mt-2 text-sm tabular-nums">{number}</p>
          <p className="text-sm text-muted-foreground">{formatDateLong(issued ?? Date.now())}</p>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Customer</p>
          <p className="mt-1 font-medium">{job.customer.name || "—"}</p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {[job.customer.address, job.customer.phone, job.customer.email].filter(Boolean).join("\n")}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Job</p>
          <p className="mt-1 font-medium">{job.name}</p>
          <p className="text-sm text-muted-foreground">
            {JOB_TYPE_LABEL[job.jobType]}
            {job.siteAddress ? ` · ${job.siteAddress}` : ""}
          </p>
          {kind === "booking" && job.docs.bookingDate ? (
            <p className="mt-2 text-sm font-medium">Booked: {job.docs.bookingDate}</p>
          ) : null}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg">Take-off</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            <Line k="Gross tiled surfaces" v={m2(area.gross)} />
            <Line k="Windows, doors and other deductions" v={`− ${m2(area.openings)}`} />
            <Line k="Net area to tile" v={m2(area.net)} />
            <Line k={`Waste & cuts (${area.effectiveWastePct}%)`} v={m2(area.wasteM2)} />
            <Line k="Area used for ordering" v={m2(area.orderM2)} />
            <Line k={`${job.tile.name || "Tiles"} including spacers`} v={`${qty(tiles.recommended)} tiles`} />
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg">Price</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            {tot.tiles > 0 ? <Line k="Tiles supplied" v={gbp(tot.tiles)} /> : <Line k="Tiles" v="Customer supply" />}
            <Line k="Fixing materials (adhesive, grout, silicone, primer, trims)" v={gbp(tot.materials)} />
            <Line
              k={`Labour — ${labour.days} day${labour.days === 1 ? "" : "s"} (${labour.sizeLabel.toLowerCase()})`}
              v={gbp(tot.labour)}
            />
            {job.extras.map((e) => (
              <Line key={e.id} k={`${e.label} (${e.qty} ${e.unit})`} v={gbp(e.qty * e.unitPrice)} />
            ))}
            {job.waterproofing.enabled ? (
              <Line
                k={`Waterproofing ${job.waterproofing.preset.replace("_", " ")} (${m2(job.waterproofing.wallM2 + job.waterproofing.floorM2)})`}
                v="included in materials & labour"
              />
            ) : null}
            <Line k="Net" v={gbp(tot.net)} />
            {tot.vatPct > 0 ? <Line k={`VAT at ${tot.vatPct}%`} v={gbp(tot.vat)} /> : <Line k="VAT" v="Not charged" />}
            <Line k="Total" v={gbp(tot.gross)} strong />
            {kind !== "receipt" ? <Line k={`Deposit ${tot.depositPct}%`} v={gbp(tot.deposit)} /> : null}
            {kind !== "receipt" ? <Line k="Balance on completion" v={gbp(tot.balance)} /> : null}
            {kind === "receipt" ? <Line k="Amount received" v={gbp(tot.gross)} strong /> : null}
          </tbody>
        </table>
      </section>

      {kind === "quote" || kind === "booking" ? (
        <section className="mt-8">
          <h2 className="font-display text-lg">Materials on this job</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {mats.map((m) => (
              <li key={m.id}>
                {m.qty} {m.unit} {m.name}
                {m.optional ? " (if required)" : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {job.notes ? (
        <section className="mt-8">
          <h2 className="font-display text-lg">Notes</h2>
          <p className="mt-2 text-sm whitespace-pre-line">{job.notes}</p>
        </section>
      ) : null}

      {kind === "quote" ? (
        <section className="mt-8 rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium">To go ahead</p>
          <p className="mt-1 text-muted-foreground">
            Reply to this quote with a preferred start week. We will send a booking confirmation and a deposit request
            for {gbp(tot.deposit)}. This quote is valid for {business.quoteValidityDays} days.
          </p>
        </section>
      ) : null}

      {kind === "booking" ? (
        <section className="mt-8 rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium">Deposit to confirm the date</p>
          <p className="mt-1 text-muted-foreground">
            Please pay {gbp(tot.deposit)} to hold {job.docs.bookingDate || "the agreed date"}. Bank details are below.
            The balance of {gbp(tot.balance)} is due on completion.
          </p>
        </section>
      ) : null}

      {(kind === "booking" || kind === "invoice") && (business.bankName || business.bankSort) ? (
        <section className="mt-6 text-sm">
          <p className="font-medium">Payment</p>
          <p className="mt-1 text-muted-foreground">
            {business.bankName}
            {business.bankSort ? ` · Sort ${business.bankSort}` : ""}
            {business.bankAccount ? ` · Acc ${business.bankAccount}` : ""}
          </p>
        </section>
      ) : null}

      <section className="mt-10 border-t border-border pt-6">
        <h2 className="font-display text-lg">Terms</h2>
        <p className="mt-2 text-xs leading-relaxed whitespace-pre-line text-muted-foreground">{business.terms}</p>
        {business.insuranceNote ? <p className="mt-3 text-xs text-muted-foreground">{business.insuranceNote}</p> : null}
      </section>
    </article>
  );
}

function Line({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <tr className="border-b border-border/80">
      <td className="py-2 pr-3">{k}</td>
      <td className={`py-2 text-right tabular-nums ${strong ? "font-semibold" : ""}`}>{v}</td>
    </tr>
  );
}
