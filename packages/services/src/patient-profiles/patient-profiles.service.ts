import {
  PatientProfileScope,
  PatientProfileStatus,
  PatientProfileVersionState,
  type PatientProfileCatalogueItem,
  type PatientProfileDetail,
} from '@hektor/types';
import { patientProfileDocumentV1Schema } from '@hektor/types/contracts/patient-profiles';
import { HektorErrorCode } from '@hektor/types/contracts';
import type { Database } from '@hektor/types/database';

import type { DatabaseClient } from '../database';
import { createServiceError } from '../errors';

type ProfileRow = Database['public']['Tables']['patient_profiles']['Row'];

type VersionRow =
  Database['public']['Tables']['patient_profile_versions']['Row'];

function displayName(document: PatientProfileDetail['document']) {
  return document.identity.preferredName
    ? `${document.identity.preferredName} ${document.identity.familyName}`
    : [...document.identity.givenNames, document.identity.familyName].join(' ');
}

function chooseVisibleVersion(versions: readonly VersionRow[]) {
  return (
    versions.find(
      ({ state }) => state === PatientProfileVersionState.Published,
    ) ??
    versions.find(({ state }) => state === PatientProfileVersionState.Draft)
  );
}

function mapCatalogueItem(profile: ProfileRow, version: VersionRow) {
  const parsed = patientProfileDocumentV1Schema.safeParse(version.document);
  if (!parsed.success) {
    throw createServiceError(HektorErrorCode.InternalServerError, {
      message: 'Unable to load patient profile',
      internalMessage: parsed.error.message,
      cause: parsed.error,
    });
  }
  const { catalogue, identity } = parsed.data;
  return {
    id: profile.id,
    slug: profile.slug,
    displayName: displayName(parsed.data),
    dateOfBirth: identity.dateOfBirth,
    versionId: version.id,
    versionNumber: version.version_number,
    versionState: version.state as PatientProfileVersionState,
    synopsis: catalogue.synopsis,
    lifeStage: catalogue.lifeStage,
    careSettings: catalogue.careSettings,
    specialties: catalogue.specialties,
    tags: catalogue.tags,
  } satisfies PatientProfileCatalogueItem;
}

export function createPatientProfilesService(client: DatabaseClient) {
  async function getVisibleVersions(profileIds: readonly string[]) {
    if (!profileIds.length) return [];
    const result = await client
      .from('patient_profile_versions')
      .select('*')
      .in('patient_profile_id', [...profileIds])
      .in('state', [
        PatientProfileVersionState.Published,
        PatientProfileVersionState.Draft,
      ])
      .order('version_number', { ascending: false });
    if (result.error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to load patient profiles',
        internalMessage: result.error.message,
        cause: result.error,
      });
    }
    return result.data;
  }

  async function listAdminPatientProfiles(): Promise<
    PatientProfileCatalogueItem[]
  > {
    const profiles = await client
      .from('patient_profiles')
      .select('*')
      .eq('scope', PatientProfileScope.System)
      .eq('status', PatientProfileStatus.Active)
      .order('slug');
    if (profiles.error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to load patient profiles',
        internalMessage: profiles.error.message,
        cause: profiles.error,
      });
    }
    const versions = await getVisibleVersions(
      profiles.data.map(({ id }) => id),
    );
    return profiles.data.flatMap((profile) => {
      const version = chooseVisibleVersion(
        versions.filter(({ patient_profile_id: id }) => id === profile.id),
      );
      return version ? [mapCatalogueItem(profile, version)] : [];
    });
  }

  async function getAdminPatientProfile(
    profileId: string,
  ): Promise<PatientProfileDetail> {
    const profile = await client
      .from('patient_profiles')
      .select('*')
      .eq('id', profileId)
      .eq('scope', PatientProfileScope.System)
      .eq('status', PatientProfileStatus.Active)
      .maybeSingle();
    if (profile.error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to load patient profile',
        internalMessage: profile.error.message,
        cause: profile.error,
      });
    }
    if (!profile.data) {
      throw createServiceError(HektorErrorCode.NotFound, {
        message: 'Patient profile not found',
      });
    }
    const version = chooseVisibleVersion(await getVisibleVersions([profileId]));
    if (!version) {
      throw createServiceError(HektorErrorCode.NotFound, {
        message: 'Patient profile not found',
      });
    }
    const item = mapCatalogueItem(profile.data, version);
    const document = patientProfileDocumentV1Schema.parse(version.document);
    return {
      ...item,
      document,
      changeSummary: version.change_summary,
      ...(version.source_reference
        ? { sourceReference: version.source_reference }
        : {}),
      ...(version.source_revision
        ? { sourceRevision: version.source_revision }
        : {}),
      updatedAt: new Date(version.updated_at).toISOString(),
    };
  }

  return { getAdminPatientProfile, listAdminPatientProfiles };
}
