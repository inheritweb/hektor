'use client';

import {
  useAdminPatientProfile,
  useAdminPatientProfileVersion,
  useAdminPatientProfiles,
} from '@hektor/query/patient-profiles';
import {
  PatientBackgroundCategory,
  PatientRelationshipRole,
} from '@hektor/types';
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

  const profileIndex = profiles.data.data.findIndex(
    ({ id }) => id === profile.id,
  );
  const previousProfile = profiles.data.data[profileIndex - 1];
  const nextProfile = profiles.data.data[profileIndex + 1];

  return (
    <ResolvedPatientEhrPreview
      expectedVersionId={versionId}
      nextPatient={
        nextProfile
          ? {
              href: `/ehr/patients/${encodeURIComponent(nextProfile.slug)}`,
              label: nextProfile.displayName,
            }
          : undefined
      }
      previousPatient={
        previousProfile
          ? {
              href: `/ehr/patients/${encodeURIComponent(previousProfile.slug)}`,
              label: previousProfile.displayName,
            }
          : undefined
      }
      profileId={profile.id}
    />
  );
}

function ResolvedPatientEhrPreview({
  expectedVersionId,
  nextPatient,
  previousPatient,
  profileId,
}: {
  expectedVersionId?: string;
  nextPatient?: { href: string; label: string };
  previousPatient?: { href: string; label: string };
  profileId: string;
}) {
  const currentProfile = useAdminPatientProfile(
    { params: { profileId } },
    {
      placeholderData: (previousProfile) => previousProfile,
    },
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
      nextPatient={nextPatient}
      patient={{
        allergyRecordStatus: patient.document.allergyRecordStatus,
        allergies: patient.document.allergies.map((allergy) => ({
          clinicalStatus: allergy.clinicalStatus,
          details: allergy.details,
          id: allergy.id,
          reactions: allergy.reactions,
          severity: allergy.severity,
          substance: allergy.substance.display,
          verificationStatus: allergy.verificationStatus,
        })),
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
          gpPractice: backgroundSummary(
            patient.document.background,
            'gp-practice',
          )
            ?.replace(/^Registered with /, '')
            .replace(/\.$/, ''),
          handedness: backgroundSummary(
            patient.document.background,
            'right-handed',
          ),
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
        recordName: `${patient.document.identity.familyName}, ${patient.document.identity.preferredName ?? patient.document.identity.givenNames.join(' ')}`,
        identifiers: patient.document.identifiers.map((identifier) => ({
          display: identifier.display ?? 'Patient identifier',
          value: identifier.value,
        })),
        organisationName: 'Jean McFarlane Trust',
        personalContext: patient.document.background
          .filter(({ category }) =>
            [
              'adverse_life_event',
              'cultural',
              'education',
              'family',
              'living_arrangements',
              'occupation',
              'social',
            ].includes(category),
          )
          .map(({ category, details, id, summary }) => ({
            category,
            details,
            id,
            summary,
          })),
        safeguarding: patient.document.background
          .filter(
            ({ category }) =>
              category === PatientBackgroundCategory.Safeguarding,
          )
          .map(({ details, id, sensitivity, summary }) => ({
            details,
            id,
            sensitivity,
            summary,
          })),
        baselineMedications: patient.document.baselineMedications.map(
          (medication) => ({
            details: medication.details,
            dose: medication.dose,
            frequency: medication.frequency,
            id: medication.id,
            indication: medication.indication,
            medication: medication.medication.display,
            route: medication.route?.display,
            status: medication.status,
          }),
        ),
        clinicalHistory: {
          familyHistory: patient.document.background
            .filter(({ category }) => category === 'family_history')
            .map(({ details, summary }) => details ?? summary),
          lifestyleAndSocialHistory: patient.document.background
            .filter(({ category }) => category === 'lifestyle')
            .map(({ details, summary }) =>
              details ? `${summary} — ${details}` : summary,
            ),
          pastMedicalHistory: patient.document.problems
            .filter(({ id }) => id !== 'recent-low-mood')
            .map(({ details, problem }) =>
              details ? `${problem.display} — ${details}` : problem.display,
            ),
        },
        historyEntries: patient.document.history.entries,
        problems: patient.document.problems.map((problem) => ({
          clinicalStatus: problem.clinicalStatus,
          details: problem.details,
          id: problem.id,
          onsetDate: problem.onsetDate,
          problem: problem.problem.display,
          resolvedDate: problem.resolvedDate,
        })),
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
      previousPatient={previousPatient}
    />
  );
}

function backgroundSummary(
  background: readonly { id: string; summary: string }[],
  id: string,
) {
  return background.find((item) => item.id === id)?.summary;
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
