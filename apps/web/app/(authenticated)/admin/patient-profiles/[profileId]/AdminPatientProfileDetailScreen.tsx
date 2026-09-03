'use client';

import {
  useAdminPatientProfile,
  useAdminPatientProfileVersion,
} from '@hektor/query/patient-profiles';
import { useAdminPatientScenarios } from '@hektor/query/patient-scenarios';
import { PatientProfileDetailPage } from '@hektor/ui/pages';
import { useRouter } from 'next/navigation';

export function AdminPatientProfileDetailScreen({
  profileId,
  versionId,
}: {
  profileId: string;
  versionId?: string;
}) {
  const router = useRouter();
  const currentProfile = useAdminPatientProfile(
    { params: { profileId } },
    { enabled: !versionId },
  );
  const selectedVersion = useAdminPatientProfileVersion(
    { params: { profileId, versionId: versionId ?? profileId } },
    { enabled: Boolean(versionId) },
  );
  const profile = versionId ? selectedVersion : currentProfile;
  const scenarios = useAdminPatientScenarios(
    {
      params: { profileId },
      query: { versionId: profile.data?.data.versionId ?? profileId },
    },
    { enabled: profile.isSuccess },
  );
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
      onVersionChange={(selectedVersionId) =>
        router.push(
          `/admin/patient-profiles/${profileId}/version/${selectedVersionId}`,
        )
      }
      previousProfile={
        profile.data.data.navigation.previous
          ? {
              href: `/admin/patient-profiles/${profile.data.data.navigation.previous.id}`,
              label: profile.data.data.navigation.previous.displayName,
            }
          : undefined
      }
      previewHref={`/ehr/patients/${profile.data.data.slug}/version/${profile.data.data.versionId}`}
      profile={profile.data.data}
      scenarios={scenarios.data?.data.map((scenario) => ({
        ...scenario,
        previewHref: `/ehr/scenarios/${encodeURIComponent(scenario.slug)}`,
      }))}
      scenariosError={scenarios.error?.message}
      scenariosLoading={scenarios.isPending}
    />
  );
}
