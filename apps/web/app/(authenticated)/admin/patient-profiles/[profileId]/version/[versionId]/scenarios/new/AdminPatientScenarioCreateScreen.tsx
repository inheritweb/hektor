'use client';

import { useAdminPatientProfileVersion } from '@hektor/query/patient-profiles';
import { useCreateAdminPatientScenarioDraft } from '@hektor/query/patient-scenarios';
import { AdminPatientScenarioFormPage } from '@hektor/ui/pages';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

export function AdminPatientScenarioCreateScreen({
  profileId,
  versionId,
}: {
  profileId: string;
  versionId: string;
}) {
  const router = useRouter();
  const profile = useAdminPatientProfileVersion({
    params: { profileId, versionId },
  });
  const detailHref = `/admin/patient-profiles/${profileId}/version/${versionId}`;
  const createScenario = useCreateAdminPatientScenarioDraft({
    onSuccess: () => router.push(detailHref as Route),
  });

  if (profile.isPending)
    return (
      <div
        aria-label="Loading patient profile"
        className="h-96 animate-pulse bg-accent/40"
      />
    );

  if (profile.isError)
    return (
      <p className="text-sm text-destructive" role="alert">
        {profile.error.message}
      </p>
    );

  return (
    <AdminPatientScenarioFormPage
      cancelHref={detailHref}
      error={createScenario.error?.message}
      mode="create"
      onSubmit={(values) =>
        createScenario.mutate({
          params: { profileId },
          query: { versionId },
          body: {
            title: values.title,
            slug: values.slug,
            description: values.description,
            careSetting: values.careSetting,
            intendedClinicalAudiences: values.intendedClinicalAudiences,
            beginningStep: {
              title: values.beginningStepTitle,
              ...(values.beginningStepDescription
                ? { description: values.beginningStepDescription }
                : {}),
            },
          },
        })
      }
      patientName={profile.data.data.displayName}
      pending={createScenario.isPending}
      slugError={createScenario.error?.data?.slug}
      versionNumber={profile.data.data.versionNumber}
    />
  );
}
