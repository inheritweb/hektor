'use client';

import { useAdminPatientProfile } from '@hektor/query/patient-profiles';
import { PatientProfileDetailPage } from '@hektor/ui/pages';

export function AdminPatientProfileDetailScreen({
  profileId,
}: {
  profileId: string;
}) {
  const profile = useAdminPatientProfile({ params: { profileId } });
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
  return <PatientProfileDetailPage profile={profile.data.data} />;
}
