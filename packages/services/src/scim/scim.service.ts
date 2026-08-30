import {
  SCIM_GROUP_SCHEMA,
  SCIM_LIST_RESPONSE_SCHEMA,
  SCIM_USER_SCHEMA,
  type ScimListResponse,
  type ScimGroup,
  type ScimGroupInput,
  type ScimUser,
  type ScimUserInput,
} from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';

import type { DatabaseClient } from '../database';
import { createServiceError } from '../errors';

import { createScimTokenHash } from './scim-configuration.service';

interface ScimContext {
  organisationId: string;
}

interface ListScimUsersOptions {
  count: number;
  startIndex: number;
  userName?: string;
}

interface ListScimGroupsOptions {
  count: number;
  displayName?: string;
  startIndex: number;
}

function mapScimGroup(
  record: {
    created_at: string;
    display_name: string;
    external_id: string | null;
    id: string;
    updated_at: string;
    members?: { organisation_scim_user_id: string }[];
  },
  baseUrl: string,
): ScimGroup {
  return {
    displayName: record.display_name,
    ...(record.external_id ? { externalId: record.external_id } : {}),
    id: record.id,
    members: (record.members ?? []).map((member) => ({
      type: 'User',
      value: member.organisation_scim_user_id,
    })),
    meta: {
      created: new Date(record.created_at).toISOString(),
      lastModified: new Date(record.updated_at).toISOString(),
      location: `${baseUrl}/Groups/${record.id}`,
      resourceType: 'Group',
    },
    schemas: [SCIM_GROUP_SCHEMA],
  };
}

function mapScimUser(
  record: {
    active: boolean;
    created_at: string;
    display_name: string | null;
    external_id: string | null;
    family_name: string | null;
    given_name: string | null;
    id: string;
    updated_at: string;
    user_name: string;
  },
  baseUrl: string,
): ScimUser {
  return {
    active: record.active,
    ...(record.display_name ? { displayName: record.display_name } : {}),
    ...(record.external_id ? { externalId: record.external_id } : {}),
    id: record.id,
    meta: {
      created: new Date(record.created_at).toISOString(),
      lastModified: new Date(record.updated_at).toISOString(),
      location: `${baseUrl}/Users/${record.id}`,
      resourceType: 'User',
    },
    ...(record.given_name || record.family_name
      ? {
          name: {
            ...(record.family_name ? { familyName: record.family_name } : {}),
            ...(record.given_name ? { givenName: record.given_name } : {}),
          },
        }
      : {}),
    schemas: [SCIM_USER_SCHEMA],
    userName: record.user_name,
  };
}

export function createScimService(client: DatabaseClient) {
  async function authenticate(token: string): Promise<ScimContext> {
    const { data, error } = await client
      .from('organisation_scim_configurations')
      .select('organisation_id, organisations!inner(status)')
      .eq('token_hash', createScimTokenHash(token))
      .is('token_revoked_at', null)
      .maybeSingle();

    if (error || !data || data.organisations.status !== 'active') {
      throw createServiceError(HektorErrorCode.Unauthorized, {
        message: 'The SCIM bearer token is invalid or inactive',
        internalMessage: error?.message,
        cause: error,
      });
    }

    return { organisationId: data.organisation_id };
  }

  async function listUsers(
    context: ScimContext,
    options: ListScimUsersOptions,
    baseUrl: string,
  ): Promise<ScimListResponse<ScimUser>> {
    let query = client
      .from('organisation_scim_users')
      .select(
        'active, created_at, display_name, external_id, family_name, given_name, id, updated_at, user_name',
        { count: 'exact' },
      )
      .eq('organisation_id', context.organisationId)
      .order('created_at')
      .range(
        Math.max(options.startIndex - 1, 0),
        Math.max(options.startIndex - 1, 0) + options.count - 1,
      );
    if (options.userName) query = query.eq('user_name', options.userName);
    const { data, error, count } = await query;

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list SCIM users',
        internalMessage: error.message,
        cause: error,
      });
    }

    return {
      Resources: data.map((record) => mapScimUser(record, baseUrl)),
      itemsPerPage: data.length,
      schemas: [SCIM_LIST_RESPONSE_SCHEMA],
      startIndex: options.startIndex,
      totalResults: count ?? 0,
    };
  }

  async function getUser(
    context: ScimContext,
    userId: string,
    baseUrl: string,
  ): Promise<ScimUser> {
    const { data, error } = await client
      .from('organisation_scim_users')
      .select(
        'active, created_at, display_name, external_id, family_name, given_name, id, updated_at, user_name',
      )
      .eq('organisation_id', context.organisationId)
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) {
      throw createServiceError(
        data ? HektorErrorCode.InternalServerError : HektorErrorCode.NotFound,
        {
          message: data ? 'Unable to get SCIM user' : 'SCIM user not found',
          internalMessage: error?.message,
          cause: error,
        },
      );
    }
    return mapScimUser(data, baseUrl);
  }

  async function synchronizeUser(
    context: ScimContext,
    input: ScimUserInput,
    baseUrl: string,
    userId?: string,
  ): Promise<ScimUser> {
    const { data, error } = await client.rpc('synchronize_scim_user', {
      target_active: input.active ?? true,
      target_display_name: input.displayName ?? '',
      target_external_id: input.externalId ?? '',
      target_family_name: input.name?.familyName ?? '',
      target_given_name: input.name?.givenName ?? '',
      target_organisation_id: context.organisationId,
      target_scim_user_id: userId ?? '00000000-0000-0000-0000-000000000000',
      target_user_name: input.userName.trim().toLocaleLowerCase(),
    });

    if (error) {
      const notFound = error.message.includes('scim_user_not_found');
      const conflict =
        error.code === '23505' || error.message.includes('scim_user_conflict');
      throw createServiceError(
        notFound
          ? HektorErrorCode.NotFound
          : conflict
            ? HektorErrorCode.Conflict
            : HektorErrorCode.UnprocessableEntity,
        {
          message: notFound
            ? 'SCIM user not found'
            : conflict
              ? 'A SCIM user with this userName or externalId already exists'
              : error.message.includes('learner_seat_capacity_exhausted')
                ? 'No learner seats are available'
                : 'Unable to synchronize SCIM user',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return mapScimUser(data, baseUrl);
  }

  async function listGroups(
    context: ScimContext,
    options: ListScimGroupsOptions,
    baseUrl: string,
  ): Promise<ScimListResponse<ScimGroup>> {
    let query = client
      .from('organisation_scim_group_mappings')
      .select(
        'created_at, display_name, external_id, id, updated_at, members:organisation_scim_group_members(organisation_scim_user_id)',
        { count: 'exact' },
      )
      .eq('organisation_id', context.organisationId)
      .is('source_deleted_at', null)
      .order('created_at')
      .range(
        Math.max(options.startIndex - 1, 0),
        Math.max(options.startIndex - 1, 0) + options.count - 1,
      );
    if (options.displayName)
      query = query.eq('display_name', options.displayName);
    const { data, error, count } = await query;
    if (error)
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list SCIM groups',
        internalMessage: error.message,
        cause: error,
      });
    return {
      Resources: data.map((record) => mapScimGroup(record, baseUrl)),
      itemsPerPage: data.length,
      schemas: [SCIM_LIST_RESPONSE_SCHEMA],
      startIndex: options.startIndex,
      totalResults: count ?? 0,
    };
  }

  async function getGroup(
    context: ScimContext,
    groupId: string,
    baseUrl: string,
  ): Promise<ScimGroup> {
    const { data, error } = await client
      .from('organisation_scim_group_mappings')
      .select(
        'created_at, display_name, external_id, id, updated_at, members:organisation_scim_group_members(organisation_scim_user_id)',
      )
      .eq('organisation_id', context.organisationId)
      .eq('id', groupId)
      .is('source_deleted_at', null)
      .maybeSingle();
    if (error || !data)
      throw createServiceError(
        data ? HektorErrorCode.InternalServerError : HektorErrorCode.NotFound,
        { message: data ? 'Unable to get SCIM group' : 'SCIM group not found' },
      );
    return mapScimGroup(data, baseUrl);
  }

  async function synchronizeGroup(
    context: ScimContext,
    input: ScimGroupInput,
    baseUrl: string,
    groupId?: string,
  ): Promise<ScimGroup> {
    const memberIds = [
      ...new Set((input.members ?? []).map(({ value }) => value)),
    ];
    if (memberIds.length) {
      const members = await client
        .from('organisation_scim_users')
        .select('id')
        .eq('organisation_id', context.organisationId)
        .in('id', memberIds);
      if (members.error || members.data.length !== memberIds.length)
        throw createServiceError(HektorErrorCode.BadRequest, {
          message: 'Every SCIM group member must be a user in this tenant',
        });
    }

    const values = {
      display_name: input.displayName,
      external_id: input.externalId ?? null,
      last_synchronized_at: new Date().toISOString(),
      organisation_id: context.organisationId,
      source_deleted_at: null,
    };
    const result = groupId
      ? await client
          .from('organisation_scim_group_mappings')
          .update(values)
          .eq('organisation_id', context.organisationId)
          .eq('id', groupId)
          .select('id')
          .maybeSingle()
      : await client
          .from('organisation_scim_group_mappings')
          .insert(values)
          .select('id')
          .single();
    if (result.error || !result.data)
      throw createServiceError(
        groupId && !result.data
          ? HektorErrorCode.NotFound
          : result.error?.code === '23505'
            ? HektorErrorCode.Conflict
            : HektorErrorCode.UnprocessableEntity,
        { message: result.error?.message ?? 'SCIM group not found' },
      );
    const synchronizedGroupId = result.data.id;

    await client
      .from('organisation_scim_group_members')
      .delete()
      .eq('organisation_scim_group_mapping_id', synchronizedGroupId);
    if (memberIds.length) {
      const membership = await client
        .from('organisation_scim_group_members')
        .insert(
          memberIds.map((memberId) => ({
            organisation_id: context.organisationId,
            organisation_scim_group_mapping_id: synchronizedGroupId,
            organisation_scim_user_id: memberId,
          })),
        );
      if (membership.error)
        throw createServiceError(HektorErrorCode.UnprocessableEntity, {
          message: 'Unable to synchronize SCIM group members',
        });
    }
    await applyGroupMapping(context.organisationId, synchronizedGroupId);
    return getGroup(context, synchronizedGroupId, baseUrl);
  }

  async function deleteGroup(context: ScimContext, groupId: string) {
    const { error, count } = await client
      .from('organisation_scim_group_mappings')
      .update(
        { source_deleted_at: new Date().toISOString() },
        { count: 'exact' },
      )
      .eq('organisation_id', context.organisationId)
      .eq('id', groupId);
    if (error || !count)
      throw createServiceError(
        count ? HektorErrorCode.InternalServerError : HektorErrorCode.NotFound,
        {
          message: count
            ? 'Unable to delete SCIM group'
            : 'SCIM group not found',
        },
      );
    await client
      .from('organisation_scim_group_members')
      .delete()
      .eq('organisation_scim_group_mapping_id', groupId);
    await applyGroupMapping(context.organisationId, groupId);
  }

  async function applyGroupMapping(organisationId: string, mappingId: string) {
    const { error } = await client.rpc('apply_scim_group_mapping', {
      target_mapping_id: mappingId,
      target_organisation_id: organisationId,
    });
    if (error)
      throw createServiceError(HektorErrorCode.UnprocessableEntity, {
        message: 'Unable to apply SCIM group membership',
        internalMessage: error.message,
      });
  }

  return {
    applyGroupMapping,
    authenticate,
    deleteGroup,
    getGroup,
    getUser,
    listGroups,
    listUsers,
    synchronizeGroup,
    synchronizeUser,
  };
}
