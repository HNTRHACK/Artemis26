"use client";

import { useEffect } from "react";
import { STORAGE_KEY, useApp } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const lang = useApp((s) => s.lang);

  useEffect(() => {
    void Promise.resolve(useApp.persist.rehydrate()).then(() => useApp.getState().finishHydration());

    // Another tab or the /mobile-demo phone frame changed the demo data: pick it up.
    // A removed key (demo reset elsewhere) is ignored here; the resetting document reseeds.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) void useApp.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Service worker: production only, so development never serves stale bundles.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // Installation is optional; the site works without it.
    });
  }, []);

  return <>{children}</>;
}
