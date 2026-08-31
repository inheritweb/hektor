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
  return (
    <PatientProfileDetailPage
      editHref={
        profile.data.data.versionState === 'draft'
          ? `/admin/patient-profiles/${profileId}/edit`
          : undefined
      }
      nextProfile={
        profile.data.data.navigation.next
          ? {
              href: `/admin/patient-profiles/${profile.data.data.navigation.next.id}`,
              label: profile.data.data.navigation.next.displayName,
            }
          : undefined
      }
      previousProfile={
        profile.data.data.navigation.previous
          ? {
              href: `/admin/patient-profiles/${profile.data.data.navigation.previous.id}`,
              label: profile.data.data.navigation.previous.displayName,
            }
          : undefined
      }
      profile={profile.data.data}
    />
  );
}
