import { Suspense } from "react";
import { PageLoading } from "@/components/AppShell";
import { JobDetail } from "./JobDetail";

export default function Page({ params }: PageProps<"/worker/jobs/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <JobDetail params={params} />
    </Suspense>
  );
}
