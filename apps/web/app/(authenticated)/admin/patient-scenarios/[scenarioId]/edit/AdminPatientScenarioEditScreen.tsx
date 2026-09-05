'use client';

import {
  useAdminPatientScenario,
  useUpdateAdminPatientScenarioDraft,
} from '@hektor/query/patient-scenarios';
import { AdminPatientScenarioFormPage } from '@hektor/ui/pages';
import { useState } from 'react';

export function AdminPatientScenarioEditScreen({
  scenarioId,
}: {
  scenarioId: string;
}) {
  const [saved, setSaved] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>();
  const scenario = useAdminPatientScenario({
    params: { scenarioIdentifier: scenarioId },
  });
  const updateScenario = useUpdateAdminPatientScenarioDraft({
    onSuccess: ({ data }) => {
      setLastUpdatedAt(data.updatedAt);
      setSaved(true);
    },
  });

  if (scenario.isPending)
    return (
      <div
        aria-label="Loading patient scenario"
        className="h-96 animate-pulse bg-accent/40"
      />
    );

  if (scenario.isError)
    return (
      <p className="text-sm text-destructive" role="alert">
        {scenario.error.message}
      </p>
    );

  const current = scenario.data.data;
  if (current.status !== 'draft')
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">
          Scenario cannot be edited
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Only draft scenarios can be changed.
        </p>
      </div>
    );

  const patient = current.patientProfile.document.identity;
  const patientName = [
    patient.preferredName ?? patient.givenNames.join(' '),
    patient.familyName,
  ].join(' ');
  const beginningStep = current.steps.find(({ kind }) => kind === 'beginning')!;
  const patientHref = `/admin/patient-profiles/${current.patientProfile.patientProfileId}/version/${current.patientProfile.id}`;

  return (
    <AdminPatientScenarioFormPage
      cancelHref={patientHref}
      error={updateScenario.error?.message}
      initialValues={{
        title: current.title,
        slug: current.slug,
        description: current.description,
        careSetting: current.careSetting,
        intendedClinicalAudiences: current.intendedClinicalAudiences,
        beginningStepTitle: beginningStep.title,
        beginningStepDescription: beginningStep.description ?? '',
      }}
      mode="edit"
      onSubmit={(values) => {
        setSaved(false);
        updateScenario.mutate({
          params: { scenarioIdentifier: scenarioId },
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
            expectedUpdatedAt: lastUpdatedAt ?? current.updatedAt,
          },
        });
      }}
      patientName={patientName}
      pending={updateScenario.isPending}
      previewHref={`/ehr/scenarios/${encodeURIComponent(current.slug)}`}
      slugError={updateScenario.error?.data?.slug}
      success={saved ? 'Scenario saved' : undefined}
      versionNumber={current.patientProfile.versionNumber}
    />
  );
}
