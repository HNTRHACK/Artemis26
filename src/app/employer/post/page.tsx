"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmployerSetup } from "@/components/EmployerSetup";
import { JobForm } from "@/components/JobForm";
import { PageTitle } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";

export default function PostJobPage() {
  const t = useT();
  const router = useRouter();
  const employer = useApp((s) => s.employer);
  const createJob = useApp((s) => s.createJob);
  // Next keeps this route mounted (hidden) after navigating away; remount the form so the next visit starts blank.
  const [formKey, setFormKey] = useState(0);

  if (!employer) return <EmployerSetup />;

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle title={t.jobForm.newTitle} sub={t.jobForm.intro} />
      <JobForm
        key={formKey}
        submitLabel={t.jobForm.publish}
        onSubmit={(draft) => {
          const id = createJob(draft);
          setFormKey((k) => k + 1);
          router.push(`/employer/jobs/${id}`);
        }}
      />
    </div>
  );
}
