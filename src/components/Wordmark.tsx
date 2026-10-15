import { cx } from "./ui";

/** UMANG wordmark: upright serif "UM" + italic marigold "ANG". Always Latin, in every language. */
export function Wordmark({ className, accent = "text-marigold" }: { className?: string; accent?: string }) {
  return (
    <span className={cx("font-serif tracking-tight", className)} aria-label="UMANG">
      <span aria-hidden>UM</span>
      <span aria-hidden className={cx("serif-i", accent)}>
        ANG
      </span>
    </span>
  );
}
