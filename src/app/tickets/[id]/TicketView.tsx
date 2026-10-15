"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ArrowLeft, Copy, FileDown, Printer, Share2, ShieldAlert } from "lucide-react";
import { StatusBadge, StatusTimeline } from "@/components/cards";
import { ContactPanel } from "@/components/ContactPanel";
import { EmptyState, LinkButton, cx } from "@/components/ui";
import { VoiceGuide } from "@/components/VoiceGuide";
import { Wordmark } from "@/components/Wordmark";
import { copyText } from "@/lib/contact";
import { formatDateLong, formatDateTime, tx, useLang, useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import type { Role } from "@/lib/types";

export function TicketView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const lang = useLang();
  const ticket = useApp((s) => s.tickets.find((x) => x.id === id || x.code === id));
  const app = useApp((s) => (ticket ? s.applications.find((a) => a.id === ticket.applicationId) : undefined));
  const storedRole = useApp((s) => s.role);
  const [viewAs, setViewAs] = useState<Role>(storedRole ?? "worker");
  const [note, setNote] = useState("");
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Web Share support is client-only
    setCanShare(typeof navigator.share === "function");
  }, []);

  if (!ticket) {
    return <EmptyState title={t.ticket.notFound} action={<LinkButton href="/choose-role">{t.common.goBack}</LinkButton>} />;
  }

  const status = app?.status ?? "confirmed";
  const pay = `${t.common.inr(ticket.wage)} ${t.wageUnit[ticket.wageUnit]}`;
  const location = `${tx(ticket.address, lang)}, ${t.areas[ticket.area]}, Mumbai`;
  const summary = t.ticket.summary({
    code: ticket.code,
    title: tx(ticket.title, lang),
    worker: ticket.workerName,
    employer: ticket.employerName,
    location,
    start: formatDateLong(ticket.startDate, lang),
    pay,
    status: t.appStatus[status],
  });
  const spoken = `${tx(ticket.title, lang)}. ${t.ticket.pay}: ${pay}. ${t.ticket.timing}: ${t.paymentTerm[ticket.paymentTerm]}. ${t.ticket.scheduled}: ${formatDateLong(ticket.startDate, lang)}. ${t.ticket.location}: ${location}.`;

  async function share() {
    try {
      await navigator.share({ title: t.ticket.shareTitle(ticket!.code), text: summary });
    } catch {
      // user cancelled or share failed — nothing to do
    }
  }
  async function copy() {
    setNote((await copyText(summary)) ? t.ticket.copyDone : "");
  }

  const rows: [string, string][] = [
    [t.ticket.trade, t.trades[ticket.trade]],
    [t.ticket.scheduled, formatDateLong(ticket.startDate, lang)],
    [t.ticket.duration, t.duration[ticket.duration]],
    [t.ticket.hours, ticket.hours],
  ];
  const payRows: [string, string][] = [
    [t.ticket.basis, t.wageUnit[ticket.wageUnit]],
    [t.ticket.timing, t.paymentTerm[ticket.paymentTerm]],
    [t.ticket.mode, t.paymentMode[ticket.paymentMode]],
  ];
  const back = viewAs === "worker" ? "/worker/applications" : `/employer/jobs/${ticket.jobId}`;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={back} className="inline-flex min-h-11 items-center gap-2 font-semibold hover:underline">
          <ArrowLeft size={20} aria-hidden /> {t.common.back}
        </Link>
        <div role="radiogroup" aria-label={t.ticket.viewAs} className="inline-flex items-center gap-1 rounded-full bg-ivory-2 p-1">
          <span className="px-2 text-sm text-muted">{t.ticket.viewAs}</span>
          {(["worker", "employer"] as const).map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={viewAs === r}
              onClick={() => setViewAs(r)}
              className={cx("min-h-10 rounded-full px-4 text-sm font-semibold", viewAs === r ? "bg-ink text-ivory" : "")}
            >
              {r === "worker" ? t.common.worker : t.common.employer}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- the ticket ---------- */}
      <article
        aria-labelledby="ticket-title"
        className="overflow-hidden rounded-[2rem] border-2 border-ink bg-white shadow-[0_30px_80px_-40px_rgba(11,10,9,0.5)] print:rounded-xl print:shadow-none"
      >
        <header className="relative bg-ink px-6 py-6 text-ivory sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Wordmark className="block text-3xl leading-none" />
              <p className="mt-1 text-xs tracking-[0.18em] text-mist uppercase">{t.brand.tagline}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-mist">{t.ticket.id}</p>
              <p className="font-mono text-xl tracking-wider text-marigold sm:text-2xl" data-ticket-code>
                {ticket.code}
              </p>
            </div>
          </div>
          <h1 id="ticket-title" className="kicker mt-6 text-mist">
            {t.ticket.title}
          </h1>
          <p className="mt-2 text-2xl leading-snug font-semibold sm:text-3xl">{tx(ticket.title, lang)}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <StatusBadge status={status} />
            <span className="text-mist">
              {t.ticket.created}: {formatDateTime(ticket.createdAt, lang)}
            </span>
          </div>
        </header>

        {/* perforation */}
        <div aria-hidden className="relative h-0 border-t-2 border-dashed border-ink/25">
          <span className="absolute -top-4 -left-4 size-8 rounded-full border-2 border-ink bg-ivory print:bg-white" />
          <span className="absolute -top-4 -right-4 size-8 rounded-full border-2 border-ink bg-ivory print:bg-white" />
        </div>

        <div className="grid gap-6 px-6 py-7 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted">{t.ticket.worker}</p>
              <p className="text-xl font-semibold" data-ticket-worker>
                {ticket.workerName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted">{t.ticket.employer}</p>
              <p className="text-xl font-semibold">{ticket.employerName}</p>
              {ticket.employerContact && (
                <p className="text-sm text-muted">
                  {t.ticket.contactPerson}: {ticket.employerContact}
                </p>
              )}
            </div>
          </div>

          <section className="print-avoid-break rounded-2xl bg-ivory p-5 print:border print:border-ink/20">
            <p className="text-sm text-muted">{t.ticket.pay}</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl" data-ticket-pay>
              {t.common.inr(ticket.wage)} <span className="text-lg font-normal text-muted">{t.wageUnit[ticket.wageUnit]}</span>
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              {payRows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-sm text-muted">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-sm text-muted">{k}</dt>
                <dd className="text-lg font-semibold">{v}</dd>
              </div>
            ))}
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted">{t.ticket.location}</dt>
              <dd className="text-lg font-semibold">{location}</dd>
            </div>
          </dl>

          <div className="print-avoid-break">
            <p className="text-sm text-muted">{t.ticket.description}</p>
            <p className="mt-1 leading-relaxed">{tx(ticket.description, lang)}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted">{t.ticket.tools}</p>
              <p className="mt-1 font-semibold">{ticket.tools || t.offer.none}</p>
            </div>
            <div>
              <p className="text-sm text-muted">{t.ticket.instructions}</p>
              <p className="mt-1 font-semibold">{ticket.instructions || t.offer.none}</p>
            </div>
          </div>

          <p className="print-avoid-break flex gap-3 rounded-2xl border-2 border-danger/30 bg-danger/5 p-4">
            <ShieldAlert className="mt-0.5 shrink-0 text-danger" size={20} aria-hidden /> {t.ticket.safety}
          </p>
          <p className="border-t border-ink/15 pt-4 text-xs text-muted">
            {t.ticket.disclaimer} {t.brand.disclaimer}
          </p>
        </div>
      </article>

      {/* ---------- actions ---------- */}
      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-5 font-semibold text-ivory hover:bg-ink-3">
          <Printer size={18} aria-hidden /> {t.ui.print}
        </button>
        <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-ink px-5 font-semibold hover:bg-ink hover:text-ivory">
          <FileDown size={18} aria-hidden /> {t.ui.savePdf}
        </button>
        {canShare && (
          <button type="button" onClick={share} className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-ink px-5 font-semibold hover:bg-ink hover:text-ivory">
            <Share2 size={18} aria-hidden /> {t.ui.share}
          </button>
        )}
        <button type="button" onClick={copy} className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-ink px-5 font-semibold hover:bg-ink hover:text-ivory">
          <Copy size={18} aria-hidden /> {t.ui.copy}
        </button>
        <p role="status" className="self-center text-sm font-semibold text-success">
          {note}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-6 print:hidden">
        <VoiceGuide guide="ticket-help" />
        <VoiceGuide text={spoken} />
        <ContactPanel ticket={ticket} app={app} viewAs={viewAs} />
        {app && (
          <section aria-labelledby="hist" className="rounded-3xl border-2 border-ivory-3 bg-white/55 p-5 sm:p-6">
            <h2 id="hist" className="mb-4 text-2xl font-semibold">
              {t.hire.history}
            </h2>
            <StatusTimeline history={app.history} />
          </section>
        )}
      </div>
    </div>
  );
}
