"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Copy, Lock, MessageCircle, MessageSquareText, Phone } from "lucide-react";
import { copyText, formatIndianMobile, smsLink, telLink, whatsappLink } from "@/lib/contact";
import { formatDateLong, useLang, useT } from "@/lib/i18n";
import { HIRED } from "@/lib/lifecycle";
import type { Application, Role, Ticket } from "@/lib/types";
import { cx } from "./ui";

/** The message both sides can send, in the viewer's language. */
export function useTicketMessage(ticket: Ticket) {
  const t = useT();
  const lang = useLang();
  return t.contact.message({
    code: ticket.code,
    trade: t.trades[ticket.trade],
    location: `${t.areas[ticket.area]}, Mumbai`,
    start: formatDateLong(ticket.startDate, lang),
    pay: `${t.common.inr(ticket.wage)} ${t.wageUnit[ticket.wageUnit]}`,
  });
}

function Action({ href, icon, label, primary }: { href: string | null; icon: ReactNode; label: string; primary?: boolean }) {
  const cls = cx(
    "inline-flex min-h-14 flex-1 basis-40 items-center justify-center gap-2 rounded-full px-5 text-base font-semibold",
    primary ? "bg-[#1f7a4a] text-white hover:bg-[#19663d]" : "border-2 border-ink text-ink hover:bg-ink hover:text-ivory",
  );
  if (!href)
    return (
      <span aria-disabled="true" className={cx(cls, "cursor-not-allowed border-ink/20 bg-transparent text-ink/40 hover:bg-transparent hover:text-ink/40")}>
        {icon} {label}
      </span>
    );
  return (
    <a href={href} className={cls} target={href.startsWith("https:") ? "_blank" : undefined} rel="noopener noreferrer" data-contact={label}>
      {icon} {label}
    </a>
  );
}

/**
 * WhatsApp / SMS / call for a confirmed hire. Links are only built for complete,
 * valid numbers the other person agreed to share. Nothing is sent automatically.
 */
export function ContactPanel({ ticket, app, viewAs }: { ticket: Ticket; app: Application | undefined; viewAs: Role }) {
  const t = useT();
  const message = useTicketMessage(ticket);
  const [copied, setCopied] = useState(false);
  const [ua, setUa] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- user agent only exists on the client
    setUa(navigator.userAgent);
  }, []);

  const hired = !!app && HIRED.includes(app.status);
  const otherPhone = viewAs === "worker" ? ticket.employerPhone : ticket.workerPhone;
  const consented = viewAs === "worker" ? !!app?.offer?.employerConsent : !!app?.workerConsent;
  const phone = hired && consented ? otherPhone : "";
  const wa = whatsappLink(phone, message);
  const sms = smsLink(phone, message, ua);
  const tel = telLink(phone);

  return (
    <section aria-labelledby="comms" className="print-avoid-break rounded-3xl border-2 border-ink p-5 sm:p-6 print:hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="comms" className="text-2xl font-semibold">
          {t.contact.title}
        </h2>
        <p className="text-sm text-muted">{viewAs === "worker" ? t.contact.withEmployer : t.contact.withWorker}</p>
      </div>

      {!hired ? (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-ivory-2 p-4 font-medium">
          <Lock size={18} className="mt-0.5 shrink-0" aria-hidden /> {t.hire.contactLocked}
        </p>
      ) : (
        <>
          {tel ? (
            <p className="mt-3 text-lg font-semibold tabular-nums">{formatIndianMobile(phone)}</p>
          ) : (
            <p role="note" className="mt-3 rounded-2xl bg-ivory-2 p-4 font-medium">
              {consented ? t.contact.noNumber : t.contact.noConsent}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Action href={wa} primary icon={<MessageCircle size={20} aria-hidden />} label={t.contact.whatsapp} />
            <Action href={sms} icon={<MessageSquareText size={20} aria-hidden />} label={t.contact.sms} />
            <Action href={tel} icon={<Phone size={20} aria-hidden />} label={t.contact.call} />
          </div>
          <details className="mt-4 rounded-2xl bg-ivory-2 p-4">
            <summary className="cursor-pointer font-semibold">{t.contact.preview}</summary>
            <pre className="mt-3 font-sans text-sm whitespace-pre-wrap">{message}</pre>
          </details>
          <button
            type="button"
            onClick={async () => setCopied(await copyText(message))}
            className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-full px-4 font-semibold underline-offset-4 hover:underline"
          >
            <Copy size={16} aria-hidden /> {copied ? t.contact.copied : t.contact.copyMessage}
          </button>
          <span role="status" className="sr-only">
            {copied ? t.contact.copied : ""}
          </span>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-muted">
            <li>{t.contact.howItWorks}</li>
            <li>{t.contact.smsFallback}</li>
            <li>{t.contact.privacy}</li>
          </ul>
        </>
      )}
    </section>
  );
}
