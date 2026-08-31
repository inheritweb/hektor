'use client';

import {
  useAdminPatientProfile,
  useAdminPatientProfileVersion,
  useAdminPatientProfiles,
} from '@hektor/query/patient-profiles';
import { PatientRelationshipRole } from '@hektor/types';
import { buttonVariants } from '@hektor/ui/atoms';
import { NavigationLink } from '@hektor/ui/context';
import { PatientEhrPreviewPage } from '@hektor/ui/pages';

export function PatientEhrPreviewScreen({
  patientSlug,
  versionId,
}: {
  patientSlug: string;
  versionId?: string;
}) {
  const profiles = useAdminPatientProfiles();

  if (profiles.isPending) return <PreviewLoading />;

  if (profiles.isError)
    return <PreviewError message={profiles.error.message} />;

  const profile = profiles.data.data.find(({ slug }) => slug === patientSlug);

  if (!profile)
    return <PreviewError message="That patient profile could not be found." />;

  return (
    <ResolvedPatientEhrPreview
      expectedVersionId={versionId}
      profileId={profile.id}
    />
  );
}

function ResolvedPatientEhrPreview({
  expectedVersionId,
  profileId,
}: {
  expectedVersionId?: string;
  profileId: string;
}) {
  const currentProfile = useAdminPatientProfile(
    { params: { profileId } },
    { enabled: !expectedVersionId },
  );
  const selectedVersion = useAdminPatientProfileVersion(
    {
      params: {
        profileId,
        versionId: expectedVersionId ?? profileId,
      },
    },
    { enabled: Boolean(expectedVersionId) },
  );
  const profile = expectedVersionId ? selectedVersion : currentProfile;
  const exitHref = expectedVersionId
    ? `/admin/patient-profiles/${profileId}/version/${expectedVersionId}`
    : `/admin/patient-profiles/${profileId}`;

  if (profile.isPending) return <PreviewLoading />;

  if (profile.isError)
    return <PreviewError exitHref={exitHref} message={profile.error.message} />;

  const patient = profile.data.data;

  return (
    <PatientEhrPreviewPage
      exitHref={exitHref}
      patient={{
        communication: {
          accessibilityNeeds:
            patient.document.communication.accessibilityNeeds.map((need) => ({
              details: need.details,
              id: need.id,
              summary: need.summary,
            })),
          languages: patient.document.communication.languages.map(
            (language) => ({
              id: language.id,
              interpreterRequirement: authoredBooleanDetail(
                language.interpreterRequired?.status,
                language.interpreterRequired?.status === 'known'
                  ? language.interpreterRequired.value
                  : undefined,
              ),
              language: language.language.display,
              preferred:
                patient.document.communication.preferredLanguageId ===
                language.id,
              proficiency: language.proficiency,
            }),
          ),
          preferences: patient.document.communication.preferences.map(
            (preference) => ({
              details: preference.details,
              id: preference.id,
              summary: preference.summary,
            }),
          ),
        },
        dateOfBirth: patient.dateOfBirth,
        details: {
          address: patient.document.contact?.address
            ? [
                ...patient.document.contact.address.lines,
                patient.document.contact.address.city,
                patient.document.contact.address.region,
                patient.document.contact.address.postalCode,
                patient.document.contact.address.country,
              ].filter((part): part is string => Boolean(part))
            : undefined,
          email: patient.document.contact?.email,
          ethnicity: authoredDetail(patient.document.demographics.ethnicity),
          faithOrBelief: authoredDetail(
            patient.document.demographics.faithOrBelief,
          ),
          nationality: authoredDetail(
            patient.document.demographics.nationality,
          ),
          phone: patient.document.contact?.phone,
          nextOfKin: patient.document.relationships
            .filter(({ roles }) =>
              roles.includes(PatientRelationshipRole.NextOfKin),
            )
            .map((relationship) => {
              const contact = [
                relationship.contact?.phone,
                relationship.contact?.email,
              ]
                .filter(Boolean)
                .join(' / ');
              return `${relationship.name} (${relationship.relationship.display})${contact ? ` — ${contact}` : ''}${relationship.notes ? ` — ${relationship.notes}` : ''}`;
            }),
          occupationAndSocial:
            patient.document.background
              .filter(({ category }) =>
                ['occupation', 'living_arrangements', 'social'].includes(
                  category,
                ),
              )
              .map(({ summary }) => summary)
              .join(' ') || undefined,
          pronouns: authoredTextDetail(
            patient.document.identity.pronouns?.status,
            patient.document.identity.pronouns?.status === 'known'
              ? patient.document.identity.pronouns.value.join('/')
              : undefined,
          ),
          sexAtBirth: authoredTextDetail(
            patient.document.identity.sexAtBirth?.status,
            patient.document.identity.sexAtBirth?.status === 'known'
              ? patient.document.identity.sexAtBirth.value
              : undefined,
          ),
        },
        displayName: patient.displayName,
        identifiers: patient.document.identifiers.map((identifier) => ({
          display: identifier.display ?? 'Patient identifier',
          value: identifier.value,
        })),
        organisationName: 'Jean McFarlane Trust',
        recordContext: 'Electronic Patient Record — Base profile preview',
        relationships: patient.document.relationships.map((relationship) => ({
          email: relationship.contact?.email,
          id: relationship.id,
          name: relationship.name,
          notes: relationship.notes,
          phone: relationship.contact?.phone,
          relationship: relationship.relationship.display,
          roles: relationship.roles,
        })),
        versionNumber: patient.versionNumber,
        versionState: patient.versionState,
      }}
    />
  );
}

function authoredBooleanDetail(status?: string, value?: boolean) {
  if (!status) return { status: 'not_recorded' as const };
  if (status === 'known')
    return {
      status: 'known' as const,
      value: value ? 'Required' : 'Not required',
    };
  if (status === 'not_applicable') return { status: 'not_applicable' as const };
  return { status: 'unknown' as const };
}

function authoredTextDetail(status?: string, value?: string) {
  if (!status) return { status: 'not_recorded' as const };
  if (status === 'known')
    return { status: 'known' as const, value: value ?? 'Not recorded' };
  if (status === 'not_applicable') return { status: 'not_applicable' as const };
  return { status: 'unknown' as const };
}

function authoredDetail(detail?: {
  status: string;
  value?: { display: string };
}) {
  if (!detail) return { status: 'not_recorded' as const };
  if (detail.status === 'known')
    return {
      status: 'known' as const,
      value: detail.value?.display ?? 'Not recorded',
    };
  if (detail.status === 'not_applicable')
    return { status: 'not_applicable' as const };
  return { status: 'unknown' as const };
}

function PreviewLoading() {
  return (
    <div
      aria-label="Loading EHR preview"
      className="min-h-dvh animate-pulse bg-accent/30"
    />
  );
}

function PreviewError({
  exitHref = '/admin/patient-profiles',
  message,
}: {
  exitHref?: string;
  message: string;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6">
      <div className="max-w-lg border border-destructive/30 bg-surface p-6">
        <h1 className="text-xl font-bold">Unable to open EHR preview</h1>
        <p className="mt-2 text-sm text-destructive" role="alert">
          {message}
        </p>
        <NavigationLink
          className={`${buttonVariants({ variant: 'outline' })} mt-5`}
          href={exitHref}
        >
          Return to patient profiles
        </NavigationLink>
      </div>
    </main>
  );
}
