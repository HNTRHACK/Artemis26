/**
 * User-initiated contact links. Nothing here sends a message: each link only opens
 * WhatsApp, the SMS app or the dialler with a prefilled draft.
 */

/**
 * Normalise an Indian mobile number to E.164 digits without "+", e.g. "919876543210".
 * Accepts "9876543210", "09876543210", "+91 98765 43210", "91-9876543210".
 * Returns null for masked, partial or non-mobile numbers (so no link is activated).
 */
export function normalizeIndianMobile(raw: string | undefined | null): string | null {
  if (!raw || /[xX*]/.test(raw)) return null;
  let d = raw.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (!/^[6-9]\d{9}$/.test(d)) return null;
  return `91${d}`;
}

/** Official click-to-chat format: https://wa.me/<number without +>?text=<urlencoded> */
export function whatsappLink(phone: string, message: string): string | null {
  const n = normalizeIndianMobile(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : null;
}

/**
 * sms: URI. RFC 5724 uses "?body=", which Android and current iOS accept;
 * older iOS versions only understood "&body=", so iOS gets that form.
 */
export function smsLink(phone: string, message: string, userAgent = ""): string | null {
  const n = normalizeIndianMobile(phone);
  if (!n) return null;
  const sep = /iPad|iPhone|iPod/.test(userAgent) ? "&" : "?";
  return `sms:+${n}${sep}body=${encodeURIComponent(message)}`;
}

export function telLink(phone: string): string | null {
  const n = normalizeIndianMobile(phone);
  return n ? `tel:+${n}` : null;
}

/** "+91 98765 43210" for display. */
export function formatIndianMobile(phone: string): string {
  const n = normalizeIndianMobile(phone);
  return n ? `+91 ${n.slice(2, 7)} ${n.slice(7)}` : phone;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers without async clipboard (or without permission).
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
