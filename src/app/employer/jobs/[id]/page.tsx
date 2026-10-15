import { Suspense } from "react";
import { PageLoading } from "@/components/AppShell";
import { ManageJob } from "./ManageJob";

export default function Page({ params }: PageProps<"/employer/jobs/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ManageJob params={params} />
    </Suspense>
  );
}
