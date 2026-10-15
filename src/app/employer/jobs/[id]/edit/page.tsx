import { Suspense } from "react";
import { PageLoading } from "@/components/AppShell";
import { EditJob } from "./EditJob";

export default function Page({ params }: PageProps<"/employer/jobs/[id]/edit">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <EditJob params={params} />
    </Suspense>
  );
}
