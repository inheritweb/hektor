import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  OrganisationRole,
  ProvisioningStatus,
  SCIM_GROUP_SCHEMA,
  SCIM_USER_SCHEMA,
  ScimGroupTargetType,
} from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';

import { createIntegrationDatabaseClient } from '../testing/local-supabase';

import { createScimConfigurationService } from './scim-configuration.service';
import { createScimService } from './scim.service';

const client = createIntegrationDatabaseClient();

const configuration = createScimConfigurationService(client);

const scim = createScimService(client);

const organisationId = randomUUID();

const organisationSlug = `scim-${organisationId}`;

const baseUrl = 'https://hektor.example/api/scim/v2';

let token = '';

let linkedAuthUserId = '';

describe('SCIM services', () => {
  beforeAll(async () => {
    const organisation = await client.from('organisations').insert({
      id: organisationId,
      name: 'SCIM Integration University',
      slug: organisationSlug,
    });
    if (organisation.error) throw organisation.error;
    token = (await configuration.issueToken(organisationId)).data.token;
  });

  afterAll(async () => {
    await client
      .from('organisation_scim_group_mappings')
      .delete()
      .eq('organisation_id', organisationId);
    await client
      .from('organisation_groups')
      .delete()
      .eq('organisation_id', organisationId);
    await client
      .from('organisation_cohorts')
      .delete()
      .eq('organisation_id', organisationId);
    await client
      .from('organisation_scim_users')
      .delete()
      .eq('organisation_id', organisationId);
    await client
      .from('organisation_user_provisions')
      .delete()
      .eq('organisation_id', organisationId);
    await client
      .from('organisation_users')
      .delete()
      .eq('organisation_id', organisationId);
    await client
      .from('organisation_scim_configurations')
      .delete()
      .eq('organisation_id', organisationId);
    if (linkedAuthUserId) await client.auth.admin.deleteUser(linkedAuthUserId);
    await client.from('organisations').delete().eq('id', organisationId);
  });

  it('authenticates only the active organisation bearer token', async () => {
    await expect(scim.authenticate('not-the-token')).rejects.toMatchObject({
      code: HektorErrorCode.Unauthorized,
    });
    await expect(scim.authenticate(token)).resolves.toEqual({ organisationId });
  });

  it('stores only a hash and invalidates a revoked token', async () => {
    const stored = await client
      .from('organisation_scim_configurations')
      .select('token_hash, token_suffix')
      .eq('organisation_id', organisationId)
      .single();
    expect(stored.data?.token_hash).not.toBe(token);
    expect(stored.data?.token_hash).toHaveLength(64);
    expect(stored.data?.token_suffix).toBe(token.slice(-4));

    await configuration.revokeToken(organisationId);
    await expect(scim.authenticate(token)).rejects.toMatchObject({
      code: HektorErrorCode.Unauthorized,
    });
    token = (await configuration.issueToken(organisationId)).data.token;
    await expect(scim.authenticate(token)).resolves.toEqual({ organisationId });
  });

  it('creates a pending provision without creating a Hektor account', async () => {
    const context = await scim.authenticate(token);
    const email = `pending-${randomUUID()}@example.test`;
    const user = await scim.synchronizeUser(
      context,
      {
        active: true,
        externalId: `external-${randomUUID()}`,
        name: { familyName: 'Learner', givenName: 'Pending' },
        schemas: [SCIM_USER_SCHEMA],
        userName: email,
      },
      baseUrl,
    );

    const [provision, authUsers] = await Promise.all([
      client
        .from('organisation_user_provisions')
        .select('provisioned_role, status')
        .eq('id', user.id)
        .maybeSingle(),
      client.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);
    const scimRecord = await client
      .from('organisation_scim_users')
      .select('current_provision_id')
      .eq('id', user.id)
      .single();
    const currentProvision = await client
      .from('organisation_user_provisions')
      .select('provisioned_role, status')
      .eq('id', scimRecord.data!.current_provision_id!)
      .single();

    expect(provision.data).toBeNull();
    expect(currentProvision.data).toEqual({
      provisioned_role: OrganisationRole.Learner,
      status: ProvisioningStatus.Pending,
    });
    expect(authUsers.data.users.some((item) => item.email === email)).toBe(
      false,
    );
  });

  it('links an existing account, revokes it, and creates a new provision when re-enabled', async () => {
    const email = `linked-${randomUUID()}@example.test`;
    const authUser = await client.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { first_name: 'Linked', last_name: 'Learner' },
    });
    if (authUser.error) throw authUser.error;
    linkedAuthUserId = authUser.data.user.id;
    const context = await scim.authenticate(token);
    const input = {
      active: true,
      externalId: `external-${randomUUID()}`,
      name: { familyName: 'Learner', givenName: 'Linked' },
      schemas: [SCIM_USER_SCHEMA],
      userName: email,
    };

    const created = await scim.synchronizeUser(context, input, baseUrl);
    const firstRecord = await client
      .from('organisation_scim_users')
      .select('current_provision_id')
      .eq('id', created.id)
      .single();
    const firstProvisionId = firstRecord.data!.current_provision_id!;
    const linked = await client
      .from('organisation_user_provisions')
      .select('organisation_user_id, status')
      .eq('id', firstProvisionId)
      .single();
    expect(linked.data?.status).toBe(ProvisioningStatus.Linked);

    await scim.synchronizeUser(
      context,
      { ...input, active: false },
      baseUrl,
      created.id,
    );
    const revoked = await client
      .from('organisation_user_provisions')
      .select('status')
      .eq('id', firstProvisionId)
      .single();
    const suspendedMembership = await client
      .from('organisation_users')
      .select('status')
      .eq('id', linked.data!.organisation_user_id!)
      .single();
    expect(revoked.data?.status).toBe(ProvisioningStatus.Revoked);
    expect(suspendedMembership.data?.status).toBe('suspended');

    await scim.synchronizeUser(context, input, baseUrl, created.id);
    const reenabled = await client
      .from('organisation_scim_users')
      .select('current_provision_id')
      .eq('id', created.id)
      .single();
    const activeMembership = await client
      .from('organisation_users')
      .select('status')
      .eq('id', linked.data!.organisation_user_id!)
      .single();
    const history = await client
      .from('organisation_user_provisions')
      .select('id, status')
      .eq('organisation_id', organisationId)
      .eq('provisioned_user_name', email);

    expect(reenabled.data?.current_provision_id).not.toBe(firstProvisionId);
    expect(activeMembership.data?.status).toBe('active');
    expect(history.data).toHaveLength(2);
    expect(history.data?.map(({ status }) => status).sort()).toEqual([
      ProvisioningStatus.Linked,
      ProvisioningStatus.Revoked,
    ]);
  });

  it('removes only SCIM ownership when a source group member is removed', async () => {
    const context = await scim.authenticate(token);
    const scimUser = await scim.synchronizeUser(
      context,
      {
        active: true,
        externalId: `group-user-${randomUUID()}`,
        schemas: [SCIM_USER_SCHEMA],
        userName: `group-user-${randomUUID()}@example.test`,
      },
      baseUrl,
    );
    const target = await client
      .from('organisation_groups')
      .insert({
        name: `Target ${randomUUID()}`,
        organisation_id: organisationId,
      })
      .select('id')
      .single();
    const source = await scim.synchronizeGroup(
      context,
      {
        displayName: 'Directory tutorial group',
        externalId: `group-${randomUUID()}`,
        members: [{ type: 'User', value: scimUser.id }],
        schemas: [SCIM_GROUP_SCHEMA],
      },
      baseUrl,
    );
    await configuration.updateGroupMapping(organisationId, source.id, {
      targetId: target.data!.id,
      targetType: ScimGroupTargetType.Group,
    });
    const scimRecord = await client
      .from('organisation_scim_users')
      .select('current_provision_id')
      .eq('id', scimUser.id)
      .single();
    const assigned = await client
      .from('organisation_provisioned_group_users')
      .select('manually_assigned, scim_group_mapping_ids')
      .eq('organisation_group_id', target.data!.id)
      .eq(
        'organisation_user_provision_id',
        scimRecord.data!.current_provision_id!,
      )
      .single();
    expect(assigned.data).toEqual({
      manually_assigned: false,
      scim_group_mapping_ids: [source.id],
    });

    await client
      .from('organisation_provisioned_group_users')
      .update({ manually_assigned: true })
      .eq('organisation_group_id', target.data!.id)
      .eq(
        'organisation_user_provision_id',
        scimRecord.data!.current_provision_id!,
      );
    await scim.synchronizeGroup(
      context,
      {
        displayName: source.displayName,
        externalId: source.externalId,
        members: [],
        schemas: [SCIM_GROUP_SCHEMA],
      },
      baseUrl,
      source.id,
    );
    const retained = await client
      .from('organisation_provisioned_group_users')
      .select('manually_assigned, scim_group_mapping_ids')
      .eq('organisation_group_id', target.data!.id)
      .eq(
        'organisation_user_provision_id',
        scimRecord.data!.current_provision_id!,
      )
      .single();
    expect(retained.data).toEqual({
      manually_assigned: true,
      scim_group_mapping_ids: [],
    });
  });

  it('maps source membership directly to a cohort without creating a group', async () => {
    const context = await scim.authenticate(token);
    const scimUser = await scim.synchronizeUser(
      context,
      {
        active: true,
        schemas: [SCIM_USER_SCHEMA],
        userName: `cohort-user-${randomUUID()}@example.test`,
      },
      baseUrl,
    );
    const cohort = await client
      .from('organisation_cohorts')
      .insert({
        ends_on: '2027-08-01',
        name: `Cohort ${randomUUID()}`,
        organisation_id: organisationId,
        starts_on: '2026-09-01',
      })
      .select('id')
      .single();
    const source = await scim.synchronizeGroup(
      context,
      {
        displayName: 'Directory cohort',
        members: [{ value: scimUser.id }],
        schemas: [SCIM_GROUP_SCHEMA],
      },
      baseUrl,
    );
    await configuration.updateGroupMapping(organisationId, source.id, {
      targetId: cohort.data!.id,
      targetType: ScimGroupTargetType.Cohort,
    });
    const scimRecord = await client
      .from('organisation_scim_users')
      .select('current_provision_id')
      .eq('id', scimUser.id)
      .single();
    const provision = await client
      .from('organisation_user_provisions')
      .select(
        'cohort_manually_assigned, organisation_cohort_id, scim_cohort_mapping_ids',
      )
      .eq('id', scimRecord.data!.current_provision_id!)
      .single();
    expect(provision.data).toEqual({
      cohort_manually_assigned: false,
      organisation_cohort_id: cohort.data!.id,
      scim_cohort_mapping_ids: [source.id],
    });
    const groups = await client
      .from('organisation_groups')
      .select('id', { count: 'exact', head: true })
      .eq('organisation_id', organisationId)
      .eq('source_external_id', source.externalId ?? '');
    expect(groups.count).toBe(0);
  });
});
