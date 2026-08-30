'use client';

import { useAdminPatientProfiles } from '@hektor/query/patient-profiles';
import { PatientProfilesPage } from '@hektor/ui/pages';

export function AdminPatientProfilesScreen() {
  const profiles = useAdminPatientProfiles();
  return (
    <PatientProfilesPage
      error={profiles.error?.message}
      getProfileHref={({ id }) => `/admin/patient-profiles/${id}`}
      loading={profiles.isPending}
      profiles={profiles.data?.data ?? []}
    />
  );
}
