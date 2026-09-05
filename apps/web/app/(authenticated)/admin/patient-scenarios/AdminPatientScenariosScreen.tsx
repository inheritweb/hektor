'use client';

import { useAdminPatientScenarioCatalogue } from '@hektor/query/patient-scenarios';
import { AdminPatientScenariosPage } from '@hektor/ui/pages';

export function AdminPatientScenariosScreen() {
  const scenarios = useAdminPatientScenarioCatalogue();

  return (
    <AdminPatientScenariosPage
      error={scenarios.error?.message}
      loading={scenarios.isPending}
      scenarios={(scenarios.data?.data ?? []).map((scenario) => {
        const { familyName, givenNames, preferredName } =
          scenario.patientProfile.document.identity;
        return {
          id: scenario.id,
          title: scenario.title,
          patientName:
            `${preferredName ?? givenNames[0] ?? ''} ${familyName}`.trim(),
          description: scenario.description,
          status: scenario.status,
          careSetting: scenario.careSetting,
          versionNumber: scenario.patientProfile.versionNumber,
        };
      })}
    />
  );
}
