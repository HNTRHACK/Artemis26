"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoading } from "@/components/AppShell";
import { useApp } from "@/lib/store";

/** Entry point: new workers go to onboarding, returning workers straight to their jobs. */
export default function WorkerHome() {
  const router = useRouter();
  const hasProfile = useApp((s) => s.myProfile !== null);
  useEffect(() => {
    router.replace(hasProfile ? "/worker/jobs" : "/worker/onboarding");
  }, [hasProfile, router]);
  return <PageLoading />;
}
