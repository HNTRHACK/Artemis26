"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Download, Share } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cx } from "./ui";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Env = { standalone: boolean; ios: boolean; ready: boolean };

/**
 * Real install entry point. The button appears only when the browser offers installation
 * (Chromium's beforeinstallprompt). iOS has no such API, so it gets Share → Add to Home Screen steps.
 */
export function InstallPrompt({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const t = useT();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [env, setEnv] = useState<Env>({ standalone: false, ios: false, ready: false });
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- environment is only knowable on the client
    setEnv({ standalone, ios, ready: true });

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setAccepted(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!env.ready) return null;
  const dark = tone === "dark";
  const box = cx("flex flex-col gap-3 rounded-3xl p-5", dark ? "bg-ivory/10 text-ivory" : "bg-ivory-2", className);

  if (env.standalone || accepted) {
    return (
      <div className={box} role="status" data-install-state="installed">
        <p className="flex items-center gap-2 font-semibold">
          <CircleCheck size={20} className="text-success" aria-hidden /> {accepted ? t.install.accepted : t.install.installed}
        </p>
      </div>
    );
  }

  if (deferred) {
    return (
      <div className={box} data-install-state="promptable">
        <button
          type="button"
          onClick={async () => {
            await deferred.prompt();
            const { outcome } = await deferred.userChoice;
            if (outcome === "accepted") setAccepted(true);
            setDeferred(null);
          }}
          className="inline-flex min-h-14 items-center justify-center gap-2 self-start rounded-full bg-marigold px-6 text-lg font-semibold text-ink hover:brightness-95"
        >
          <Download size={20} aria-hidden /> {t.install.button}
        </button>
      </div>
    );
  }

  if (env.ios) {
    return (
      <div className={box} data-install-state="ios">
        <p className="flex items-center gap-2 font-semibold">
          <Share size={20} aria-hidden /> {t.install.iosHint}
        </p>
      </div>
    );
  }

  // No install API available right now (unsupported browser, already dismissed, or not https):
  // show guidance rather than a button that would do nothing.
  return (
    <div className={box} data-install-state="manual">
      <p className={cx("text-sm", dark ? "text-mist" : "text-muted")}>{t.install.https}</p>
    </div>
  );
}
