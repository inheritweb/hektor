import { createHash } from 'node:crypto';

import {
  PatientProfileScope,
  PatientProfileStatus,
  PatientProfileVersionState,
  type PatientProfileCatalogueItem,
  type PatientProfileDetail,
} from '@hektor/types';
import { patientProfileDocumentV1Schema } from '@hektor/types/contracts/patient-profiles';
import { HektorErrorCode } from '@hektor/types/contracts';
import type { Database, Json } from '@hektor/types/database';

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

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${canonicalJson(nested)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function contentHash(document: PatientProfileDetail['document']) {
  return createHash('sha256').update(canonicalJson(document)).digest('hex');
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

  async function updateAdminPatientProfileDraft(
    profileId: string,
    input: {
      changeSummary: string;
      document: PatientProfileDetail['document'];
      expectedUpdatedAt: string;
    },
    userId: string,
  ): Promise<PatientProfileDetail> {
    const updated = await client
      .from('patient_profile_versions')
      .update({
        authored_by: userId,
        change_summary: input.changeSummary,
        content_hash: contentHash(input.document),
        document: input.document as unknown as Json,
      })
      .eq('patient_profile_id', profileId)
      .eq('state', PatientProfileVersionState.Draft)
      .eq('updated_at', input.expectedUpdatedAt)
      .select('id')
      .maybeSingle();
    if (updated.error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to update patient profile draft',
        internalMessage: updated.error.message,
        cause: updated.error,
      });
    }
    if (!updated.data) {
      throw createServiceError(HektorErrorCode.Conflict, {
        message:
          'This draft has changed or is no longer available. Reload it before saving.',
      });
    }
    return getAdminPatientProfile(profileId);
  }

  return {
    getAdminPatientProfile,
    listAdminPatientProfiles,
    updateAdminPatientProfileDraft,
  };
}
