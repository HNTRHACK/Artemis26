import { Suspense } from "react";
import { PageLoading } from "@/components/AppShell";
import { TicketView } from "./TicketView";

export default function Page({ params }: PageProps<"/tickets/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <TicketView params={params} />
    </Suspense>
  );
}
