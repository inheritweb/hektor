'use client';

import { useAdminPatientScenarioResolvedRecord } from '@hektor/query/patient-scenarios';
import { useState } from 'react';

import { ResolvedPatientEhrPreview } from '../../patients/[patientSlug]/PatientEhrPreviewScreen';

export function ScenarioEhrPreviewScreen({
  scenarioSlug,
}: {
  scenarioSlug: string;
}) {
  const [selectedStepId, setSelectedStepId] = useState<string>();
  const preview = useAdminPatientScenarioResolvedRecord(
    {
      params: { scenarioIdentifier: scenarioSlug },
      query: { stepId: selectedStepId },
    },
    { placeholderData: (previousPreview) => previousPreview },
  );

  if (preview.isPending)
    return (
      <div
        aria-label="Loading scenario EHR preview"
        className="min-h-dvh animate-pulse bg-accent/30"
      />
    );

  if (preview.isError)
    return (
      <main className="grid min-h-dvh place-items-center bg-background p-6">
        <p className="text-sm text-destructive" role="alert">
          {preview.error.message}
        </p>
      </main>
    );

  const scenario = preview.data.data.context.scenario;

  return (
    <ResolvedPatientEhrPreview
      onScenarioStepChange={setSelectedStepId}
      profileId={scenario.patientProfile.patientProfileId}
      scenarioPreview={preview.data.data}
    />
  );
}
