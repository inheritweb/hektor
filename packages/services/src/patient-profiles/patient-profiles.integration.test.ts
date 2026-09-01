import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { patientProfileDocumentV1Schema } from '@hektor/types';
import type { Json } from '@hektor/types/database';

import { createPatientProfilesService } from './patient-profiles.service';

import {
  createIntegrationAuthClient,
  createIntegrationDatabaseClient,
} from '../testing/local-supabase';

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);

const productionSeed = resolve(repositoryRoot, 'supabase/seeds/production.sql');

const adminClient = createIntegrationDatabaseClient();

const createdUserIds: string[] = [];

const createdProfileIds: string[] = [];

const seedSlugs = [
  'adam-marsden',
  'adebayo-omolade',
  'amina-warsame',
  'emma-barlow',
  'esther-jenkins',
  'sarah-williams',
];

function readSeedProfile(slug: string) {
  return JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        'supabase/seeds/patient-profiles',
        `${slug}.json`,
      ),
      'utf8',
    ),
  ) as Json;
}

function applyProductionSeed() {
  execFileSync(
    'docker',
    [
      'exec',
      '-i',
      'supabase_db_hektor',
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
    ],
    {
      cwd: repositoryRoot,
      input: readFileSync(productionSeed),
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );
}

async function createAuthUser(platformAdmin = false) {
  const password = `Hektor-${randomUUID()}!`;
  const email = `patient-profile-${randomUUID()}@example.com`;
  const result = await adminClient.auth.admin.createUser({
    app_metadata: platformAdmin ? { role: 'admin' } : {},
    email,
    email_confirm: true,
    password,
  });
  if (result.error) throw result.error;
  createdUserIds.push(result.data.user.id);
  return { email, password, userId: result.data.user.id };
}

async function signedInClient(email: string, password: string) {
  const client = createIntegrationAuthClient();
  const signedIn = await client.auth.signInWithPassword({ email, password });
  if (signedIn.error) throw signedIn.error;
  return client;
}

describe('patient profile database foundation', () => {
  beforeAll(async () => {
    applyProductionSeed();

    const existing = await adminClient
      .from('patient_profiles')
      .select('id')
      .in('id', createdProfileIds);
    if (existing.error) throw existing.error;
  });

  afterAll(async () => {
    if (createdProfileIds.length) {
      const versions = await adminClient
        .from('patient_profile_versions')
        .delete()
        .in('patient_profile_id', createdProfileIds);
      if (versions.error) throw versions.error;
      const profiles = await adminClient
        .from('patient_profiles')
        .delete()
        .in('id', createdProfileIds);
      if (profiles.error) throw profiles.error;
    }
    for (const userId of createdUserIds)
      await adminClient.auth.admin.deleteUser(userId);
  });

  it('loads the deterministic production system draft profiles', async () => {
    const profiles = await adminClient
      .from('patient_profiles')
      .select('id, scope, slug')
      .eq('scope', 'system')
      .in('slug', seedSlugs)
      .order('slug');

    expect(profiles.error).toBeNull();
    expect(profiles.data?.map(({ slug }) => slug)).toEqual(seedSlugs);
    const versions = await adminClient
      .from('patient_profile_versions')
      .select('id, patient_profile_id, state, document')
      .in(
        'patient_profile_id',
        (profiles.data ?? []).map(({ id }) => id),
      );
    expect(versions.error).toBeNull();
    for (const profile of profiles.data ?? []) {
      const profileVersions = (versions.data ?? []).filter(
        ({ patient_profile_id: profileId }) => profileId === profile.id,
      );
      expect(profileVersions).toHaveLength(1);
      expect(profileVersions[0]?.state).toBe('draft');
      expect(
        patientProfileDocumentV1Schema.safeParse(profileVersions[0]?.document)
          .success,
      ).toBe(true);
      expect(profileVersions[0]?.document).toEqual(
        readSeedProfile(profile.slug),
      );
    }
  });

  it('provides the draft catalogue preview and profile detail to the admin API layer', async () => {
    const service = createPatientProfilesService(adminClient);
    const profiles = await service.listAdminPatientProfiles();

    expect(profiles).toHaveLength(7);
    expect(profiles.map(({ displayName }) => displayName)).toContain(
      'Amina Warsame',
    );
    expect(profiles.map(({ displayName }) => displayName)).toContain(
      'Sally Williams',
    );
    expect(profiles.map(({ displayName }) => displayName)).toContain(
      'James Bond',
    );
    expect(
      profiles
        .filter(({ slug }) => seedSlugs.includes(slug))
        .every(({ versionState }) => versionState === 'draft'),
    ).toBe(true);
    expect(
      profiles.find(({ slug }) => slug === 'james-bond')?.versionState,
    ).toBe('published');

    const detail = await service.getAdminPatientProfile(profiles[0]!.id);
    expect(detail.id).toBe(profiles[0]!.id);
    expect(detail.document.synthetic).toBe(true);
    expect(detail.versionState).toBe('draft');
  });

  it('loads the development-only James Bond version history', async () => {
    const profile = await adminClient
      .from('patient_profiles')
      .select('id')
      .eq('scope', 'system')
      .eq('slug', 'james-bond')
      .single();
    expect(profile.error).toBeNull();

    const versions = await adminClient
      .from('patient_profile_versions')
      .select('version_number, state, document')
      .eq('patient_profile_id', profile.data!.id)
      .order('version_number');
    expect(versions.error).toBeNull();
    expect(versions.data?.map(({ state }) => state)).toEqual([
      'superseded',
      'superseded',
      'published',
    ]);
    expect(
      versions.data?.every(
        ({ document }) =>
          patientProfileDocumentV1Schema.safeParse(document).success,
      ),
    ).toBe(true);
  });

  it('applies the production seed repeatedly without changing records', async () => {
    applyProductionSeed();

    const profiles = await adminClient
      .from('patient_profiles')
      .select('id', { count: 'exact' })
      .eq('scope', 'system')
      .in('slug', seedSlugs);
    const versions = await adminClient
      .from('patient_profile_versions')
      .select('id', { count: 'exact' })
      .in(
        'patient_profile_id',
        (profiles.data ?? []).map(({ id }) => id),
      );

    expect(profiles.error).toBeNull();
    expect(profiles.count).toBe(6);
    expect(versions.error).toBeNull();
    expect(versions.count).toBe(6);
  });

  it('enforces exclusive ownership and owner-scoped slugs', async () => {
    const firstUser = await createAuthUser();
    const secondUser = await createAuthUser();
    const organisations = await adminClient
      .from('organisations')
      .select('id')
      .limit(1)
      .single();
    if (organisations.error) throw organisations.error;
    const invalidId = randomUUID();
    const invalid = await adminClient.from('patient_profiles').insert({
      id: invalidId,
      scope: 'system',
      slug: `invalid-${randomUUID()}`,
      user_id: firstUser.userId,
    });
    expect(invalid.error).not.toBeNull();
    const invalidOrganisation = await adminClient
      .from('patient_profiles')
      .insert({
        scope: 'organisation',
        slug: `invalid-organisation-${randomUUID()}`,
      });
    expect(invalidOrganisation.error).not.toBeNull();

    const slug = `owned-${randomUUID()}`;
    const firstId = randomUUID();
    const secondId = randomUUID();
    const organisationId = randomUUID();
    createdProfileIds.push(firstId, secondId, organisationId);
    const first = await adminClient.from('patient_profiles').insert({
      id: firstId,
      scope: 'user',
      slug,
      user_id: firstUser.userId,
    });
    const duplicate = await adminClient.from('patient_profiles').insert({
      scope: 'user',
      slug,
      user_id: firstUser.userId,
    });
    const otherOwner = await adminClient.from('patient_profiles').insert({
      id: secondId,
      scope: 'user',
      slug,
      user_id: secondUser.userId,
    });
    const organisationOwner = await adminClient
      .from('patient_profiles')
      .insert({
        id: organisationId,
        organisation_id: organisations.data.id,
        scope: 'organisation',
        slug,
      });

    expect(first.error).toBeNull();
    expect(duplicate.error).not.toBeNull();
    expect(otherOwner.error).toBeNull();
    expect(organisationOwner.error).toBeNull();
  });

  it('allows only platform administrators to read the foundation', async () => {
    const platformAdmin = await createAuthUser(true);
    const ordinaryUser = await createAuthUser();
    const adminAuthClient = await signedInClient(
      platformAdmin.email,
      platformAdmin.password,
    );
    const userAuthClient = await signedInClient(
      ordinaryUser.email,
      ordinaryUser.password,
    );
    const anonymousClient = createIntegrationAuthClient();

    const adminRead = await adminAuthClient
      .from('patient_profiles')
      .select('id');
    const userRead = await userAuthClient.from('patient_profiles').select('id');
    const anonymousRead = await anonymousClient
      .from('patient_profiles')
      .select('id');
    const directWrite = await userAuthClient.from('patient_profiles').insert({
      scope: 'user',
      slug: `forbidden-${randomUUID()}`,
      user_id: ordinaryUser.userId,
    });

    expect(adminRead.error).toBeNull();
    expect(adminRead.data?.length).toBeGreaterThanOrEqual(5);
    expect(userRead.error).toBeNull();
    expect(userRead.data).toEqual([]);
    expect(anonymousRead.error).not.toBeNull();
    expect(directWrite.error).not.toBeNull();
  }, 30_000);

  it('prevents content changes after a draft enters review', async () => {
    const author = await createAuthUser();
    const profileId = randomUUID();
    const versionId = randomUUID();
    createdProfileIds.push(profileId);
    const profile = await adminClient.from('patient_profiles').insert({
      id: profileId,
      scope: 'user',
      slug: `immutable-${randomUUID()}`,
      user_id: author.userId,
      created_by: author.userId,
    });
    expect(profile.error).toBeNull();
    const document = readSeedProfile('emma-barlow');
    const version = await adminClient.from('patient_profile_versions').insert({
      id: versionId,
      patient_profile_id: profileId,
      version_number: 1,
      state: 'in_review',
      schema_version: 1,
      document,
      content_hash: 'a'.repeat(64),
      change_summary: 'Integration test version',
      authored_by: author.userId,
      submitted_at: new Date().toISOString(),
    });
    expect(version.error).toBeNull();

    const changed = await adminClient
      .from('patient_profile_versions')
      .update({ change_summary: 'Attempted rewrite' })
      .eq('id', versionId);

    expect(changed.error?.message).toContain(
      'patient_profile_version_content_immutable',
    );
  });
});
