"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const lang = useApp((s) => s.lang);

  useEffect(() => {
    void Promise.resolve(useApp.persist.rehydrate()).then(() => useApp.getState().finishHydration());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <>{children}</>;
}
