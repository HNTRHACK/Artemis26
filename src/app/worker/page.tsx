"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Briefcase, ClipboardList, CircleQuestionMark, Scale, Smartphone, Sparkles } from "lucide-react";
import { PageLoading } from "@/components/AppShell";
import { StatusBadge, TicketCard, Wage } from "@/components/cards";
import { Button, EmptyState } from "@/components/ui";
import { tx, useLang, useT } from "@/lib/i18n";
import { HIRED } from "@/lib/lifecycle";
import { useApp } from "@/lib/store";

/** Worker home: what needs attention now. New workers are sent to onboarding. */
export default function WorkerHome() {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const me = useApp((s) => s.myProfile);
  const jobs = useApp((s) => s.jobs);
  const applications = useApp((s) => s.applications);
  const tickets = useApp((s) => s.tickets);
  const demoOfferToMe = useApp((s) => s.demoOfferToMe);
  const [demoError, setDemoError] = useState("");

  useEffect(() => {
    if (!me) router.replace("/worker/onboarding");
  }, [me, router]);
  if (!me) return <PageLoading />;

  const mine = applications.filter((a) => a.workerId === me.id).sort((a, b) => b.updatedAt - a.updatedAt);
  const offers = mine.filter((a) => a.status === "offered");
  const hired = mine.filter((a) => HIRED.includes(a.status) && a.ticketId);
  const active = mine.filter((a) => a.status === "interested" || a.status === "shortlisted");
  const jobOf = (id: string) => jobs.find((j) => j.id === id);

  const quick = [
    { href: "/worker/jobs", label: t.workerHome.quick.findWork, icon: Briefcase },
    { href: "/worker/applications", label: t.workerHome.quick.myJobs, icon: ClipboardList },
    { href: "/worker/rights", label: t.workerHome.quick.rights, icon: Scale },
    { href: "/faq", label: t.workerHome.quick.faq, icon: CircleQuestionMark },
    { href: "/install", label: t.workerHome.quick.install, icon: Smartphone },
  ];

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="display text-4xl sm:text-5xl">{t.workerHome.hello(me.name.split(" ")[0])}</h1>
        <p className="mt-3 text-lg text-muted">{t.workerHome.sub}</p>
      </header>

      {/* Offers need a decision — always first */}
      {offers.length > 0 && (
        <section aria-labelledby="offers" className="rounded-3xl bg-marigold p-5 sm:p-6">
          <h2 id="offers" className="text-2xl font-semibold">
            {t.workerHome.offersTitle}
          </h2>
          <p className="mt-1">{t.workerHome.offersHint(offers.length)}</p>
          <ul className="mt-4 flex flex-col gap-3">
            {offers.map((a) => {
              const job = jobOf(a.jobId);
              if (!job || !a.offer) return null;
              return (
                <li key={a.id}>
                  <Link
                    href={`/worker/jobs/${job.id}#offer`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ivory p-4 hover:bg-white"
                    data-offer={job.id}
                  >
                    <span>
                      <span className="block text-lg font-semibold">{tx(job.title, lang)}</span>
                      <span className="text-sm text-muted">{job.employerName}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <Wage job={a.offer} />
                      <span className="inline-flex min-h-12 items-center gap-1 rounded-full bg-ink px-4 font-semibold text-ivory">
                        {t.workerHome.reviewOffer} <ArrowUpRight size={16} aria-hidden />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="tickets">
        <h2 id="tickets" className="mb-4 text-2xl font-semibold">
          {t.workerHome.ticketsTitle}
        </h2>
        {hired.length === 0 ? (
          <EmptyState title={t.workerHome.noTickets} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {hired.map((a) => {
              const ticket = tickets.find((x) => x.id === a.ticketId);
              return ticket ? (
                <li key={a.id}>
                  <TicketCard ticket={ticket} status={a.status} href={`/tickets/${ticket.id}`} />
                </li>
              ) : null;
            })}
          </ul>
        )}
      </section>

      {offers.length === 0 && hired.length === 0 && (
        <section aria-labelledby="demo" className="rounded-3xl border-2 border-dashed border-ink/30 p-5 sm:p-6">
          <h2 id="demo" className="flex items-center gap-2 text-xl font-semibold">
            <Sparkles size={20} aria-hidden /> {t.workerHome.demoTitle}
          </h2>
          <p className="mt-2 text-muted">{t.workerHome.demoBody}</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => {
              const r = demoOfferToMe();
              setDemoError(r.ok ? "" : t.workerHome.demoFailed);
            }}
          >
            {t.workerHome.demoButton}
          </Button>
          {demoError && (
            <p role="alert" className="mt-3 font-semibold text-danger">
              {demoError}
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="active">
        <h2 id="active" className="mb-4 text-2xl font-semibold">
          {t.workerHome.activeTitle}
        </h2>
        {active.length === 0 ? (
          <p className="text-muted">{t.workerHome.noActive}</p>
        ) : (
          <ul className="flex flex-col divide-y-2 divide-ivory-3 border-y-2 border-ivory-3">
            {active.map((a) => {
              const job = jobOf(a.jobId);
              return job ? (
                <li key={a.id}>
                  <Link href={`/worker/jobs/${job.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-ivory-2/60">
                    <span className="font-semibold">{tx(job.title, lang)}</span>
                    <StatusBadge status={a.status} />
                  </Link>
                </li>
              ) : null;
            })}
          </ul>
        )}
      </section>

      <nav aria-label={t.workerNav.home} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {quick.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex min-h-24 flex-col justify-between gap-3 rounded-3xl border-2 border-ivory-3 bg-white/55 p-4 font-semibold hover:border-ink">
            <Icon size={24} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
