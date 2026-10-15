"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, Pause, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import { AUDIO_GUIDES, guideSrc, type GuideId } from "@/lib/audio-guides";
import { SPEECH_LANG, useLang, useT } from "@/lib/i18n";
import { cx } from "./ui";

/* ---------- one clip at a time, app-wide ---------- */
let stopCurrent: (() => void) | null = null;
function claim(stop: () => void) {
  if (stopCurrent && stopCurrent !== stop) stopCurrent();
  stopCurrent = stop;
}
function release(stop: () => void) {
  if (stopCurrent === stop) stopCurrent = null;
}

/* ---------- which recordings exist (fetched once per page load) ---------- */
let indexPromise: Promise<Set<string>> | null = null;
function loadIndex() {
  indexPromise ??= fetch("/api/audio-index")
    .then((r) => (r.ok ? r.json() : { files: [] }))
    .then((d: { files?: string[] }) => new Set(d.files ?? []))
    .catch(() => new Set<string>());
  return indexPromise;
}

function useRecordingAvailable(src: string | null) {
  // Keyed by src so a language change re-checks instead of reusing the old answer.
  const [result, setResult] = useState<{ src: string; ok: boolean } | null>(null);
  useEffect(() => {
    if (!src) return;
    let alive = true;
    loadIndex().then((set) => alive && setResult({ src, ok: set.has(src) }));
    return () => {
      alive = false;
    };
  }, [src]);
  if (!src) return "no";
  if (result?.src !== src) return "checking";
  return result.ok ? "yes" : "no";
}

/* ---------- device speech availability ---------- */
function useDeviceVoice(langTag: string) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null | undefined>(undefined);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- capability only knowable on the client
      setVoice(null);
      return;
    }
    const prefix = langTag.slice(0, 2);
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      setVoice(voices.find((v) => v.lang === langTag) ?? voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? null);
    };
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, [langTag]);
  return voice;
}

const SPEEDS = [0.75, 1, 1.25] as const;

/**
 * Listen button for recorded guidance (`guide`) and/or device text-to-speech (`text`).
 * Never autoplays. Recorded clips are preferred; device speech is labelled as computer-generated.
 */
export function VoiceGuide({
  guide,
  text,
  tone = "light",
  className,
}: {
  guide?: GuideId;
  /** Text for device speech: a dynamic summary, or overrides the guide script for the fallback. */
  text?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const t = useT();
  const lang = useLang();
  const src = guide ? guideSrc(guide, lang) : null;
  const recorded = useRecordingAvailable(src);
  const voice = useDeviceVoice(SPEECH_LANG[lang]);
  const speakText = text ?? (guide ? AUDIO_GUIDES[guide].script[lang] : "");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mode, setMode] = useState<"idle" | "recorded" | "device">("idle");
  const [status, setStatus] = useState<"stopped" | "loading" | "playing" | "paused" | "error">("stopped");
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setStatus("stopped");
    setProgress(0);
    setMode("idle");
  }, []);

  // Stop on unmount / route hide, and when the language changes (different clip).
  useEffect(() => () => {
    stop();
    release(stop);
  }, [stop, lang]);

  function playRecorded(fromStart = false) {
    if (!src) return;
    claim(stop);
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "none";
      a.addEventListener("waiting", () => setStatus("loading"));
      a.addEventListener("playing", () => setStatus("playing"));
      a.addEventListener("pause", () => setStatus((s) => (s === "playing" || s === "loading" ? "paused" : s)));
      a.addEventListener("timeupdate", () => setProgress(a.duration ? a.currentTime / a.duration : 0));
      a.addEventListener("ended", () => {
        setStatus("stopped");
        setProgress(1);
        release(stop);
      });
      a.addEventListener("error", () => setStatus("error"));
      audioRef.current = a;
    }
    const a = audioRef.current;
    if (!a.src.endsWith(src)) a.src = src;
    if (fromStart) a.currentTime = 0;
    a.playbackRate = speed;
    setMode("recorded");
    setStatus("loading");
    a.play().catch(() => setStatus("error"));
  }

  function playDevice() {
    if (!voice && lang !== "en") return;
    claim(stop);
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(speakText);
    u.lang = SPEECH_LANG[lang];
    if (voice) u.voice = voice;
    u.rate = speed;
    u.onstart = () => setStatus("playing");
    u.onboundary = (e) => setProgress(Math.min(1, e.charIndex / Math.max(1, speakText.length)));
    u.onend = () => {
      setStatus("stopped");
      setProgress(1);
      release(stop);
    };
    u.onerror = () => setStatus((s) => (s === "stopped" ? s : "error"));
    setMode("device");
    setStatus("loading");
    setProgress(0);
    window.speechSynthesis.speak(u);
  }

  function toggle() {
    if (mode === "recorded" && audioRef.current) {
      if (status === "playing") audioRef.current.pause();
      else {
        claim(stop);
        audioRef.current.play().catch(() => setStatus("error"));
      }
      return;
    }
    if (mode === "device") {
      if (status === "playing") {
        window.speechSynthesis.pause();
        setStatus("paused");
      } else {
        claim(stop);
        window.speechSynthesis.resume();
        setStatus("playing");
      }
    }
  }

  function changeSpeed(s: (typeof SPEEDS)[number]) {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  }

  const dark = tone === "dark";
  const canDevice = !!speakText && voice !== undefined && (voice !== null || lang === "en") && typeof window !== "undefined" && "speechSynthesis" in window;
  const active = mode !== "idle";
  const primary = cx(
    "inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-base font-semibold transition-colors",
    dark ? "bg-ivory text-ink hover:bg-marigold" : "bg-marigold text-ink hover:brightness-95",
  );
  const secondary = cx(
    "inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
    dark ? "border-ivory/30 text-ivory hover:border-ivory" : "border-ink/20 text-ink hover:border-ink",
  );

  return (
    <div
      className={cx("flex flex-col gap-2 rounded-2xl p-3", dark ? "bg-ivory/10" : "bg-ivory-2/80", "print:hidden", className)}
      data-voice-guide={guide ?? "text"}
    >
      <div className="flex flex-wrap items-center gap-2">
        {!active && recorded === "yes" && (
          <button type="button" className={primary} onClick={() => playRecorded(true)}>
            <Volume2 size={20} aria-hidden /> {t.voice.listen}
          </button>
        )}
        {!active && recorded === "checking" && (
          <span className={cx(secondary, "opacity-70")} aria-live="polite">
            <LoaderCircle size={18} className="animate-spin" aria-hidden /> {t.voice.loading}
          </span>
        )}
        {!active && recorded === "no" && (
          <>
            {guide && (
              <span className={cx("inline-flex min-h-12 items-center gap-2 px-2 text-sm", dark ? "text-mist" : "text-muted")}>
                <Volume2 size={18} aria-hidden /> {t.voice.comingSoon}
              </span>
            )}
            {canDevice ? (
              <>
                <button type="button" className={guide ? secondary : primary} onClick={playDevice}>
                  <Volume2 size={18} aria-hidden /> {guide ? t.voice.readAloud : t.voice.details}
                </button>
                {!guide && <span className={cx("text-xs", dark ? "text-mist" : "text-muted")}>{t.voice.device}</span>}
              </>
            ) : (
              !guide && <span className={cx("text-sm", dark ? "text-mist" : "text-muted")}>{t.voice.noDeviceVoice}</span>
            )}
          </>
        )}

        {active && (
          <>
            <button
              type="button"
              className={primary}
              onClick={toggle}
              disabled={status === "error"}
              aria-label={status === "playing" ? t.voice.pause : t.voice.play}
            >
              {status === "loading" ? (
                <LoaderCircle size={20} className="animate-spin" aria-hidden />
              ) : status === "playing" ? (
                <Pause size={20} aria-hidden />
              ) : (
                <Play size={20} aria-hidden />
              )}
              {status === "playing" ? t.voice.pause : t.voice.play}
            </button>
            <button
              type="button"
              className={secondary}
              onClick={() => (mode === "recorded" ? playRecorded(true) : playDevice())}
              aria-label={t.voice.replay}
            >
              <RotateCcw size={16} aria-hidden /> <span className="hidden sm:inline">{t.voice.replay}</span>
            </button>
            <button type="button" className={secondary} onClick={stop} aria-label={t.voice.stop}>
              <Square size={14} aria-hidden />
            </button>
          </>
        )}

        {(active || recorded === "yes") && (
          <div role="group" aria-label={t.voice.speed} className="ml-auto flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={speed === s}
                onClick={() => changeSpeed(s)}
                className={cx(
                  "min-h-10 min-w-11 rounded-full px-2 text-xs font-semibold tabular-nums",
                  speed === s ? (dark ? "bg-ivory text-ink" : "bg-ink text-ivory") : dark ? "text-ivory/80" : "text-ink/70",
                )}
              >
                {s}×
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div className="flex items-center gap-3 px-1">
          <div
            role="progressbar"
            aria-label={t.voice.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            className={cx("h-1.5 flex-1 overflow-hidden rounded-full", dark ? "bg-ivory/20" : "bg-ink/10")}
          >
            <div className={cx("h-full rounded-full transition-[width] duration-300", dark ? "bg-marigold" : "bg-ink")} style={{ width: `${progress * 100}%` }} />
          </div>
          <span className={cx("text-xs font-medium", dark ? "text-mist" : "text-muted")}>
            {mode === "recorded" ? t.voice.recorded : t.voice.device}
          </span>
        </div>
      )}
      {status === "error" && (
        <p role="alert" className="px-1 text-sm font-semibold text-danger">
          {t.voice.error}
        </p>
      )}
    </div>
  );
}
