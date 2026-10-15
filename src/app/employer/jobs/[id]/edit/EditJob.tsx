"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { JobForm } from "@/components/JobForm";
import { EmptyState, LinkButton, PageTitle } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";

export function EditJob({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const router = useRouter();
  const job = useApp((s) => s.jobs.find((j) => j.id === id && j.owner === "local"));
  const updateJob = useApp((s) => s.updateJob);

  if (!job) {
    return <EmptyState title={t.common.notFound} action={<LinkButton href="/employer">{t.common.goBack}</LinkButton>} />;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle title={t.jobForm.editTitle} sub={t.jobForm.intro} />
      <JobForm
        initial={job}
        submitLabel={t.jobForm.update}
        onSubmit={(draft) => {
          updateJob(job.id, draft);
          router.push(`/employer/jobs/${job.id}`);
        }}
      />
    </div>
  );
}
