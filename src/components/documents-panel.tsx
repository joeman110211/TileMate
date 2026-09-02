import { Link } from "@tanstack/react-router";
import { Check, Mail, Printer } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { quoteTotals } from "@/lib/tiling/labour";
import { STATUS_LABEL, STATUSES, type Business, type Job, type JobStatus, type Rates } from "@/lib/tiling/types";
import { gbp } from "@/lib/format";
import type { DocKind } from "@/components/quote-document";

function mailto(job: Job, business: Business, kind: DocKind, total: string, deposit: string) {
  const subject = encodeURIComponent(
    kind === "quote"
      ? `Quote ${job.docs.quoteNo} — ${job.name}`
      : kind === "booking"
        ? `Booking confirmed ${job.docs.quoteNo} — deposit ${deposit}`
        : kind === "invoice"
          ? `Invoice ${job.docs.invoiceNo} — ${job.name}`
          : `Receipt ${job.docs.invoiceNo} — ${job.name}`,
  );
  const body = encodeURIComponent(
    [
      `Hi ${job.customer.name || "there"},`,
      "",
      kind === "quote"
        ? `Please find the quote for ${job.name}. Total ${total}. Reply with a preferred start week to go ahead.`
        : kind === "booking"
          ? `Your tiling is booked${job.docs.bookingDate ? ` for ${job.docs.bookingDate}` : ""}. A deposit of ${deposit} confirms the date. Terms are on the attached confirmation.`
          : kind === "invoice"
            ? `The work at ${job.name} is complete. Invoice ${job.docs.invoiceNo} for ${total} is due on completion.`
            : `Thank you. Payment of ${total} for ${job.name} is received.`,
      "",
      business.name,
      business.phone,
      business.email,
    ].join("\n"),
  );
  const to = encodeURIComponent(job.customer.email || "");
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

export function DocumentsPanel({
  job,
  rates,
  business,
  onChange,
  assignQuoteNo,
  assignInvoiceNo,
}: {
  job: Job;
  rates: Rates;
  business: Business;
  onChange: (job: Job) => void;
  assignQuoteNo: () => string;
  assignInvoiceNo: () => string;
}) {
  const tot = quoteTotals(job, rates);

  const setStatus = (status: JobStatus) => onChange({ ...job, status });

  const sendQuote = () => {
    const no = assignQuoteNo();
    onChange({
      ...job,
      status: "quoted",
      docs: { ...job.docs, quoteNo: no, quoteSentAt: Date.now() },
    });
  };

  const accept = () =>
    onChange({ ...job, status: "accepted", docs: { ...job.docs, acceptedAt: Date.now() } });

  const book = () => {
    assignQuoteNo();
    onChange({ ...job, status: "booked", docs: { ...job.docs, depositDueAt: Date.now() } });
  };

  const invoice = () => {
    const no = assignInvoiceNo();
    onChange({
      ...job,
      status: "invoiced",
      docs: { ...job.docs, invoiceNo: no, invoicedAt: Date.now() },
    });
  };

  const paid = () =>
    onChange({ ...job, status: "paid", docs: { ...job.docs, paidAt: Date.now(), depositPaidAt: job.docs.depositPaidAt ?? Date.now() } });

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
        <p className="text-sm font-medium">Job status</p>
        <div className="mt-3 max-w-xs">
          <Select value={job.status} onValueChange={(v) => setStatus(v as JobStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="mt-4 flex max-w-xs flex-col gap-1.5">
          <span className="text-sm font-medium">Booked date</span>
          <Input
            type="date"
            value={job.docs.bookingDate}
            onChange={(e) => onChange({ ...job, docs: { ...job.docs, bookingDate: e.target.value } })}
          />
        </label>
      </div>

      <ol className="space-y-3">
        <Step n="1" title="Check the figures" body="Walk the take-off, tiles, bags and labour. Then generate the quote.">
          <Button type="button" onClick={sendQuote} className="shrink-0">
            Generate quote
          </Button>
          <DocLinks jobId={job.id} kind="quote" mailtoHref={mailto(job, business, "quote", gbp(tot.gross), gbp(tot.deposit))} />
        </Step>
        <Step
          n="2"
          title="Customer goes ahead"
          body="When they reply, mark accepted. Then pick a date and send the booking + deposit request."
        >
          <Button type="button" variant="secondary" onClick={accept}>
            <Check /> Mark accepted
          </Button>
          <Button type="button" onClick={book}>
            Send booking & deposit {gbp(tot.deposit)}
          </Button>
          <DocLinks jobId={job.id} kind="booking" mailtoHref={mailto(job, business, "booking", gbp(tot.gross), gbp(tot.deposit))} />
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange({ ...job, docs: { ...job.docs, depositPaidAt: Date.now() } })}
          >
            Deposit received
          </Button>
        </Step>
        <Step n="3" title="On site then invoice" body="When the job is finished, send the final invoice and mark paid when the balance lands.">
          <Button type="button" variant="secondary" onClick={() => setStatus("in_progress")}>
            Start on site
          </Button>
          <Button type="button" variant="secondary" onClick={() => setStatus("complete")}>
            Mark complete
          </Button>
          <Button type="button" onClick={invoice}>
            Raise invoice {gbp(tot.gross)}
          </Button>
          <DocLinks jobId={job.id} kind="invoice" mailtoHref={mailto(job, business, "invoice", gbp(tot.gross), gbp(tot.deposit))} />
          <Button type="button" variant="outline" onClick={paid}>
            Payment received
          </Button>
          <DocLinks jobId={job.id} kind="receipt" mailtoHref={mailto(job, business, "receipt", gbp(tot.gross), gbp(tot.deposit))} />
        </Step>
      </ol>
      <p className="text-xs text-muted-foreground">
        Emails open in your mail app with the customer filled in. Print or save as PDF from the document view. Add your
        bank details in Settings so deposit requests and invoices carry payment information.
      </p>
    </div>
  );
}

function Step({
  n,
  title,
  body,
  children,
}: {
  n: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <li className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Step {n}</p>
      <h3 className="mt-1 font-display text-lg">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </li>
  );
}

function DocLinks({ jobId, kind, mailtoHref }: { jobId: string; kind: DocKind; mailtoHref: string }) {
  return (
    <>
      <Button asChild variant="outline" size="default">
        <Link to="/job/$jobId" params={{ jobId }} search={{ doc: kind }}>
          <Printer /> View / print
        </Link>
      </Button>
      <Button asChild variant="outline">
        <a href={mailtoHref}>
          <Mail /> Email
        </a>
      </Button>
    </>
  );
}
