import type {
  GetOrganisationParams,
  GetOrganisationResponse,
  GetOrganisationMembershipParams,
  GetOrganisationMembershipResponse,
  CreateOrganisationContractPeriodBody,
  CreateOrganisationContractPeriodParams,
  CreateOrganisationContractPeriodResponse,
  GetOrganisationContractPeriodParams,
  GetOrganisationContractPeriodResponse,
  CreateOrganisationBody,
  CreateOrganisationResponse,
  CreateOrganisationCohortBody,
  CreateOrganisationCohortParams,
  CreateOrganisationCohortResponse,
  GetOrganisationCohortParams,
  GetOrganisationCohortResponse,
  GetOrganisationGroupParams,
  GetOrganisationGroupResponse,
  CreateOrganisationGroupBody,
  CreateOrganisationGroupParams,
  CreateOrganisationGroupResponse,
  GetOrganisationUserProvisionParams,
  GetOrganisationUserProvisionResponse,
  ListOrganisationContractPeriodsParams,
  ListOrganisationContractPeriodsQuery,
  ListOrganisationContractPeriodsResponse,
  ListOrganisationCohortsParams,
  ListOrganisationCohortsQuery,
  ListOrganisationCohortsResponse,
  ListOrganisationGroupsParams,
  ListOrganisationGroupsQuery,
  ListOrganisationGroupsResponse,
  ListOrganisationUserProvisionsParams,
  ListOrganisationUserProvisionsQuery,
  ListOrganisationUserProvisionsResponse,
  ListOrganisationUsersParams,
  ListOrganisationUsersQuery,
  ListOrganisationUsersResponse,
  ListOrganisationsQuery,
  ListOrganisationsResponse,
  UpdateOrganisationBody,
  UpdateOrganisationResponse,
  UpdateOrganisationContractPeriodBody,
  UpdateOrganisationContractPeriodParams,
  UpdateOrganisationContractPeriodResponse,
  UpdateOrganisationCohortBody,
  UpdateOrganisationCohortParams,
  UpdateOrganisationCohortResponse,
  UpdateOrganisationGroupBody,
  UpdateOrganisationGroupParams,
  UpdateOrganisationGroupResponse,
  UpdateOrganisationGroupMembershipBody,
  UpdateOrganisationGroupMembershipParams,
  UpdateOrganisationGroupMembershipResponse,
  UpdateOrganisationMembershipBody,
  UpdateOrganisationMembershipParams,
  UpdateOrganisationMembershipResponse,
  ListOrganisationMembershipCandidatesParams,
  ListOrganisationMembershipCandidatesQuery,
  ListOrganisationMembershipCandidatesResponse,
  CreateOrganisationMembershipsBody,
  CreateOrganisationMembershipsParams,
  CreateOrganisationMembershipsResponse,
  CreateOrganisationUserBody,
  CreateOrganisationUserParams,
  CreateOrganisationUserResponse,
  CommitOrganisationProvisionImportBody,
  CommitOrganisationProvisionImportParams,
  CommitOrganisationProvisionImportResponse,
  PreviewOrganisationProvisionImportBody,
  PreviewOrganisationProvisionImportParams,
  PreviewOrganisationProvisionImportResponse,
} from '@hektor/types/contracts/organisations';
import { HektorErrorCode } from '@hektor/types/contracts';
import {
  ProvisioningAutoLinkOutcome,
  ProvisioningLifecycleAction,
  OrganisationRole,
  OrganisationStatus,
  OrganisationUserStatus,
  ProvisioningStatus,
  OrganisationProvisionImportAction,
} from '@hektor/types';

import type { DatabaseClient } from '../database';
import { createServiceError } from '../errors';
import { mapUserSummary } from '../users/users.mappers';

import {
  mapOrganisation,
  mapOrganisationCohort,
  mapOrganisationContractPeriod,
  mapOrganisationCohortSummary,
  mapOrganisationGroupSummary,
  mapOrganisationGroup,
  mapOrganisationMembershipUserSummary,
  mapOrganisationMembership,
  mapOrganisationSummary,
  mapOrganisationUserProvision,
  mapOrganisationUserProvisionDetail,
} from './organisations.mappers';
import {
  buildOrganisationDetailQuery,
  buildOrganisationCohortDetailQuery,
  buildOrganisationContractPeriodsQuery,
  buildOrganisationContractPeriodQuery,
  buildOrganisationCohortsQuery,
  buildOrganisationGroupsQuery,
  buildOrganisationGroupDetailQuery,
  buildOrganisationMembershipsCountQuery,
  buildOrganisationMembershipsQuery,
  buildOrganisationMembershipDetailQuery,
  buildOrganisationSummariesQuery,
  createOrganisationQuery,
  createOrganisationContractPeriodQuery,
  createOrganisationCohortQuery,
  createOrganisationGroupQuery,
  buildOrganisationUserProvisionsCountQuery,
  buildOrganisationUserProvisionsQuery,
  buildOrganisationUserProvisionDetailQuery,
  buildProvisionAcceptanceQuery,
  acceptOrganisationUserProvisionQuery,
  buildOrganisationMembershipForUserQuery,
  transitionOrganisationUserProvisionQuery,
  updateOrganisationQuery,
  updateOrganisationContractPeriodQuery,
  updateOrganisationCohortQuery,
  updateOrganisationGroupQuery,
  updateOrganisationGroupMembershipQuery,
  updateOrganisationMembershipQuery,
  searchOrganisationMembershipCandidatesQuery,
  createOrganisationMembershipsQuery,
  buildOrganisationProvisionImportContextQuery,
  importOrganisationUserProvisionsQuery,
} from './organisations.queries';
import {
  canTransitionProvisioningStatus,
  getProvisioningTransition,
} from './provisioning-lifecycle';

function paginate<T>(items: T[], page: number, pageSize: number) {
  const first = (page - 1) * pageSize;
  return items.slice(first, first + pageSize);
}

function includesQuery(values: Array<string | undefined>, query?: string) {
  if (!query) return true;
  const normalized = query.toLocaleLowerCase();
  return values.some((value) =>
    value?.toLocaleLowerCase().includes(normalized),
  );
}

async function listAllAuthUsers(client: DatabaseClient) {
  const users = [];
  let page = 1;
  while (true) {
    const result = await client.auth.admin.listUsers({ page, perPage: 1000 });
    if (result.error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to review provision import',
        internalMessage: result.error.message,
        cause: result.error,
      });
    }
    users.push(...result.data.users);
    if (result.data.users.length < 1000) return users;
    page += 1;
  }
}

export function createOrganisationsService(client: DatabaseClient) {
  async function createOrganisation(
    body: CreateOrganisationBody,
  ): Promise<CreateOrganisationResponse> {
    const { data, error } = await createOrganisationQuery(client, body);

    if (error) {
      throw createServiceError(
        error.code === '23505'
          ? HektorErrorCode.Conflict
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === '23505'
              ? 'An organisation with this slug already exists'
              : 'Unable to create organisation',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return { data: mapOrganisationSummary(data) };
  }

  async function updateOrganisation(
    organisationId: string,
    body: UpdateOrganisationBody,
  ): Promise<UpdateOrganisationResponse> {
    const { data, error } = await updateOrganisationQuery(client, {
      ...body,
      organisationId,
    });

    if (error) {
      const conflict =
        error.code === '23505' ||
        error.message.includes('organisation_status_conflict');
      throw createServiceError(
        error.message.includes('organisation_not_found')
          ? HektorErrorCode.NotFound
          : conflict
            ? HektorErrorCode.Conflict
            : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === '23505'
              ? 'An organisation with this slug already exists'
              : conflict
                ? 'The organisation changed while you were editing it'
                : 'Unable to update organisation',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return { data: mapOrganisationSummary(data) };
  }

  async function getProvisionAcceptance(options: {
    provisionId: string;
    userId: string;
    email?: string;
    emailVerified: boolean;
  }) {
    const { data, error } = await buildProvisionAcceptanceQuery(
      client,
      options.provisionId,
    );
    const identityMatches =
      options.emailVerified &&
      options.email?.trim().toLocaleLowerCase() ===
        data?.provisioned_user_name.trim().toLocaleLowerCase();

    if (error || !data || !identityMatches) {
      throw createServiceError(HektorErrorCode.NotFound, {
        message: 'Provision invitation not found',
        internalMessage: error?.message,
        cause: error,
      });
    }
    if (data.status !== ProvisioningStatus.Pending) {
      throw createServiceError(HektorErrorCode.Conflict, {
        message: 'This provision invitation is no longer available',
      });
    }
    if (data.organisation.status !== OrganisationStatus.Active) {
      throw createServiceError(HektorErrorCode.Conflict, {
        message: 'This organisation is not currently accepting invitations',
      });
    }

    return { data: mapOrganisationUserProvisionDetail(data) };
  }

  async function acceptOrganisationUserProvision(options: {
    provisionId: string;
    userId: string;
    email?: string;
    emailVerified: boolean;
  }) {
    await getProvisionAcceptance(options);
    const { data, error } = await acceptOrganisationUserProvisionQuery(
      client,
      options.provisionId,
      options.userId,
    );

    if (error) {
      const conflict =
        error.message.includes('provision_status_conflict') ||
        error.message.includes('learner_seat_capacity_exhausted') ||
        error.message.includes('organisation_not_active');
      throw createServiceError(
        conflict
          ? HektorErrorCode.Conflict
          : HektorErrorCode.InternalServerError,
        {
          message: error.message.includes('learner_seat_capacity_exhausted')
            ? 'The organisation has no learner seats available'
            : 'Unable to accept provision invitation',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return { data: { id: data.id, status: ProvisioningStatus.Linked } };
  }

  async function transitionOrganisationUserProvision(options: {
    provisionId: string;
    expectedStatus: ProvisioningStatus;
    action: ProvisioningLifecycleAction;
    organisationUserId?: string;
  }) {
    if (
      !canTransitionProvisioningStatus(options.expectedStatus, options.action)
    ) {
      throw createServiceError(HektorErrorCode.UnprocessableEntity, {
        message: 'Invalid provision lifecycle transition',
      });
    }

    const { data, error } = await transitionOrganisationUserProvisionQuery(
      client,
      options,
    );

    if (error) {
      const isConflict =
        error.message.includes('provision_status_conflict') ||
        error.message.includes('learner_seat_capacity_exhausted');
      throw createServiceError(
        isConflict
          ? HektorErrorCode.Conflict
          : HektorErrorCode.UnprocessableEntity,
        {
          message: error.message.includes('learner_seat_capacity_exhausted')
            ? 'The current contract period has no learner seats available'
            : 'Unable to transition provision lifecycle',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return {
      data: {
        id: data.id,
        status: getProvisioningTransition(
          options.expectedStatus,
          options.action,
        )!,
      },
    };
  }

  async function autoLinkOrganisationUserProvision(options: {
    organisationId: string;
    provisionId: string;
  }) {
    const { data: provision, error: provisionError } =
      await buildOrganisationUserProvisionDetailQuery(
        client,
        options.organisationId,
        options.provisionId,
      );

    if (provisionError) {
      throw createServiceError(
        provisionError.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            provisionError.code === 'PGRST116'
              ? 'Provisioned user not found'
              : 'Unable to resolve provisioned user',
          internalMessage: provisionError.message,
          cause: provisionError,
        },
      );
    }

    if (provision.status !== ProvisioningStatus.Pending) {
      throw createServiceError(HektorErrorCode.Conflict, {
        message: 'Only a pending provision can be linked automatically',
      });
    }

    const normalizedUserName = provision.provisioned_user_name
      .trim()
      .toLocaleLowerCase();
    const { data: authData, error: authError } =
      await client.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (authError) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to resolve provisioned user',
        internalMessage: authError.message,
        cause: authError,
      });
    }

    const user = authData.users.find(
      (candidate) =>
        candidate.email_confirmed_at &&
        candidate.email?.trim().toLocaleLowerCase() === normalizedUserName,
    );

    if (!user) {
      return {
        data: {
          outcome: ProvisioningAutoLinkOutcome.PendingIdentityVerification,
        },
      };
    }

    const { data: membership, error: membershipError } =
      await buildOrganisationMembershipForUserQuery(
        client,
        options.organisationId,
        user.id,
      );

    if (membershipError) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to resolve provisioned user membership',
        internalMessage: membershipError.message,
        cause: membershipError,
      });
    }

    if (!membership) {
      return {
        data: {
          outcome: ProvisioningAutoLinkOutcome.PendingMembershipAcceptance,
        },
      };
    }

    await transitionOrganisationUserProvision({
      provisionId: provision.id,
      expectedStatus: ProvisioningStatus.Pending,
      action: ProvisioningLifecycleAction.Link,
      organisationUserId: membership.id,
    });

    return {
      data: {
        outcome: ProvisioningAutoLinkOutcome.Linked,
        organisationUserId: membership.id,
      },
    };
  }

  async function listOrganisations(
    query: ListOrganisationsQuery,
  ): Promise<ListOrganisationsResponse> {
    const { data, error, count } = await buildOrganisationSummariesQuery(
      client,
      query,
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list organisations',
        internalMessage: error.message,
        cause: error,
      });
    }

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: count ?? 0,
        sort: { order: query.order, dir: query.dir },
      },
      data: data.map(mapOrganisationSummary),
    };
  }

  async function getOrganisation(
    params: GetOrganisationParams,
  ): Promise<GetOrganisationResponse> {
    const [
      detail,
      users,
      learners,
      tutors,
      organisationAdmins,
      suspended,
      provisions,
      pendingProvisions,
      inactiveProvisions,
      failedProvisions,
    ] = await Promise.all([
      buildOrganisationDetailQuery(client, params.organisationId),
      buildOrganisationMembershipsCountQuery(client, params.organisationId),
      buildOrganisationMembershipsCountQuery(client, params.organisationId, {
        role: OrganisationRole.Learner,
      }),
      buildOrganisationMembershipsCountQuery(client, params.organisationId, {
        role: OrganisationRole.Tutor,
      }),
      buildOrganisationMembershipsCountQuery(client, params.organisationId, {
        role: OrganisationRole.OrganisationAdmin,
      }),
      buildOrganisationMembershipsCountQuery(client, params.organisationId, {
        status: OrganisationUserStatus.Suspended,
      }),
      buildOrganisationUserProvisionsCountQuery(client, params.organisationId),
      buildOrganisationUserProvisionsCountQuery(client, params.organisationId, {
        status: ProvisioningStatus.Pending,
      }),
      buildOrganisationUserProvisionsCountQuery(client, params.organisationId, {
        status: ProvisioningStatus.Inactive,
      }),
      buildOrganisationUserProvisionsCountQuery(client, params.organisationId, {
        status: ProvisioningStatus.Failed,
      }),
    ]);
    const { data, error } = detail;

    if (error) {
      throw createServiceError(
        error.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === 'PGRST116'
              ? 'Organisation not found'
              : 'Unable to get organisation',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    const counts = [
      users,
      learners,
      tutors,
      organisationAdmins,
      suspended,
      provisions,
      pendingProvisions,
      inactiveProvisions,
      failedProvisions,
    ];
    const countError = counts.find((result) => result.error)?.error;

    if (countError) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to get organisation',
        internalMessage: countError.message,
        cause: countError,
      });
    }

    return {
      data: mapOrganisation(
        data,
        {
          total: users.count ?? 0,
          learners: learners.count ?? 0,
          tutors: tutors.count ?? 0,
          organisationAdmins: organisationAdmins.count ?? 0,
          suspended: suspended.count ?? 0,
        },
        {
          total: provisions.count ?? 0,
          pending: pendingProvisions.count ?? 0,
          inactive: inactiveProvisions.count ?? 0,
          failed: failedProvisions.count ?? 0,
        },
      ),
    };
  }

  async function listOrganisationUsers(
    params: ListOrganisationUsersParams,
    query: ListOrganisationUsersQuery,
  ): Promise<ListOrganisationUsersResponse> {
    const { data, error } = await buildOrganisationMembershipsQuery(
      client,
      params.organisationId,
      {
        role: query.role,
        status: query.status,
      },
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list organisation users',
        internalMessage: error.message,
        cause: error,
      });
    }

    const users = await Promise.all(
      data.map(async (membership) => {
        const { data: authData, error: authError } =
          await client.auth.admin.getUserById(membership.user_id);
        if (authError) {
          throw createServiceError(HektorErrorCode.InternalServerError, {
            message: 'Unable to list organisation users',
            internalMessage: authError.message,
            cause: authError,
          });
        }
        return mapOrganisationMembershipUserSummary(
          membership,
          mapUserSummary(authData.user),
        );
      }),
    );
    const filtered = users.filter(({ user }) =>
      includesQuery([user.displayName, user.email], query.query),
    );
    const direction = query.dir === 'asc' ? 1 : -1;
    filtered.sort((left, right) => {
      const leftValue =
        query.order === 'role' ? left.role : left.user.displayName;
      const rightValue =
        query.order === 'role' ? right.role : right.user.displayName;
      return leftValue.localeCompare(rightValue) * direction;
    });

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: filtered.length,
        sort: { order: query.order, dir: query.dir },
      },
      data: paginate(filtered, query.page, query.pageSize),
    };
  }

  async function getOrganisationMembership(
    params: GetOrganisationMembershipParams,
  ): Promise<GetOrganisationMembershipResponse> {
    const { data, error } = await buildOrganisationMembershipDetailQuery(
      client,
      params.organisationId,
      params.membershipId,
    );

    if (error) {
      throw createServiceError(
        error.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === 'PGRST116'
              ? 'Organisation membership not found'
              : 'Unable to get organisation membership',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    const { data: authData, error: authError } =
      await client.auth.admin.getUserById(data.user_id);
    if (authError) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to get organisation membership',
        internalMessage: authError.message,
        cause: authError,
      });
    }

    return {
      data: mapOrganisationMembership(data, mapUserSummary(authData.user)),
    };
  }

  async function listOrganisationMembershipCandidates(
    params: ListOrganisationMembershipCandidatesParams,
    query: ListOrganisationMembershipCandidatesQuery,
  ): Promise<ListOrganisationMembershipCandidatesResponse> {
    const { data, error } = await searchOrganisationMembershipCandidatesQuery(
      client,
      { ...query, organisationId: params.organisationId },
    );
    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to search organisation membership candidates',
        internalMessage: error.message,
        cause: error,
      });
    }

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: Number(data[0]?.total_records ?? 0),
        sort: { order: 'displayName', dir: query.dir },
      },
      data: data.map((candidate) => ({
        id: candidate.user_id,
        displayName: candidate.display_name,
        ...(candidate.email ? { email: candidate.email } : {}),
        ...(candidate.pending_provision_id && candidate.pending_provision_role
          ? {
              pendingProvision: {
                id: candidate.pending_provision_id,
                role: candidate.pending_provision_role as OrganisationRole,
              },
            }
          : {}),
      })),
    };
  }

  async function createOrganisationMemberships(
    params: CreateOrganisationMembershipsParams,
    body: CreateOrganisationMembershipsBody,
  ): Promise<CreateOrganisationMembershipsResponse> {
    const { data, error } = await createOrganisationMembershipsQuery(client, {
      ...body,
      organisationId: params.organisationId,
    });
    if (error) {
      const notFound =
        error.message.includes('user_not_found') ||
        error.message.includes('cohort_not_found');
      const conflict =
        error.message.includes('membership_already_exists') ||
        error.message.includes('learner_seat_capacity_exhausted') ||
        error.message.includes('organisation_not_active');
      throw createServiceError(
        notFound
          ? HektorErrorCode.NotFound
          : conflict
            ? HektorErrorCode.Conflict
            : HektorErrorCode.InternalServerError,
        {
          message: error.message.includes('learner_seat_capacity_exhausted')
            ? 'No learner seats are available in the current contract period'
            : error.message.includes('membership_already_exists')
              ? 'One or more users already belong to this organisation'
              : error.message.includes('organisation_not_active')
                ? 'Users can only be added to an active organisation'
                : error.message.includes('cohort_not_found')
                  ? 'Organisation cohort not found'
                  : error.message.includes('user_not_found')
                    ? 'User not found'
                    : 'Unable to add organisation users',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return {
      data: {
        membershipIds: data.map((item) => item.membership_id),
        reconciledProvisionIds: data.flatMap((item) =>
          item.reconciled_provision_id ? [item.reconciled_provision_id] : [],
        ),
      },
    };
  }

  async function createOrganisationUser(
    params: CreateOrganisationUserParams,
    body: CreateOrganisationUserBody,
  ): Promise<CreateOrganisationUserResponse> {
    const { data: authData, error: authError } =
      await client.auth.admin.createUser({
        email: body.email,
        email_confirm: true,
        user_metadata: {
          first_name: body.firstName,
          last_name: body.lastName,
          full_name: `${body.firstName} ${body.lastName}`,
        },
      });
    if (authError) {
      throw createServiceError(
        authError.status === 422
          ? HektorErrorCode.Conflict
          : HektorErrorCode.InternalServerError,
        {
          message:
            authError.status === 422
              ? 'A user with this email already exists; connect that user instead'
              : 'Unable to create user',
          internalMessage: authError.message,
          cause: authError,
        },
      );
    }

    try {
      const membership = await createOrganisationMemberships(params, {
        cohortId: body.cohortId,
        role: body.role,
        userIds: [authData.user.id],
      });
      return {
        data: {
          membershipId: membership.data.membershipIds[0]!,
          userId: authData.user.id,
        },
      };
    } catch (error) {
      await client.auth.admin.deleteUser(authData.user.id);
      throw error;
    }
  }

  async function updateOrganisationMembership(
    params: UpdateOrganisationMembershipParams,
    body: UpdateOrganisationMembershipBody,
  ): Promise<UpdateOrganisationMembershipResponse> {
    const { error } = await updateOrganisationMembershipQuery(client, {
      ...body,
      ...params,
    });

    if (error) {
      const notFound =
        error.message.includes('membership_not_found') ||
        error.message.includes('cohort_not_found');
      const conflict =
        error.message.includes('membership_conflict') ||
        error.message.includes('learner_seat_capacity_exhausted') ||
        error.message.includes('provision_controls_membership_fields') ||
        error.message.includes('provision_status_conflict') ||
        error.message.includes('archived_organisation_is_read_only');
      throw createServiceError(
        notFound
          ? HektorErrorCode.NotFound
          : conflict
            ? HektorErrorCode.Conflict
            : HektorErrorCode.InternalServerError,
        {
          message: error.message.includes('cohort_not_found')
            ? 'Organisation cohort not found'
            : error.message.includes('membership_not_found')
              ? 'Organisation membership not found'
              : error.message.includes('membership_conflict')
                ? 'The membership changed while you were editing it'
                : error.message.includes('learner_seat_capacity_exhausted')
                  ? 'No learner seats are available in the current contract period'
                  : error.message.includes(
                        'provision_controls_membership_fields',
                      )
                    ? 'Role and cohort are controlled by the provisioning source'
                    : error.message.includes(
                          'archived_organisation_is_read_only',
                        )
                      ? 'Archived organisations are read-only'
                      : error.message.includes('provision_status_conflict')
                        ? 'The linked provision changed while you were editing it'
                        : 'Unable to update organisation membership',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return getOrganisationMembership(params);
  }

  async function listOrganisationContractPeriods(
    params: ListOrganisationContractPeriodsParams,
    query: ListOrganisationContractPeriodsQuery,
  ): Promise<ListOrganisationContractPeriodsResponse> {
    const { data, error, count } = await buildOrganisationContractPeriodsQuery(
      client,
      params.organisationId,
      query,
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list organisation contract periods',
        internalMessage: error.message,
        cause: error,
      });
    }

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: count ?? 0,
        sort: { order: query.order, dir: query.dir },
      },
      data: data.map(mapOrganisationContractPeriod),
    };
  }

  async function getOrganisationContractPeriod(
    params: GetOrganisationContractPeriodParams,
  ): Promise<GetOrganisationContractPeriodResponse> {
    const { data, error } = await buildOrganisationContractPeriodQuery(
      client,
      params.organisationId,
      params.contractPeriodId,
    );

    if (error) {
      throw createServiceError(
        error.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === 'PGRST116'
              ? 'Contract period not found'
              : 'Unable to get contract period',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return { data: mapOrganisationContractPeriod(data) };
  }

  async function createOrganisationContractPeriod(
    params: CreateOrganisationContractPeriodParams,
    body: CreateOrganisationContractPeriodBody,
  ): Promise<CreateOrganisationContractPeriodResponse> {
    const { data, error } = await createOrganisationContractPeriodQuery(
      client,
      { ...body, organisationId: params.organisationId },
    );

    if (error) {
      throw createServiceError(
        error.message.includes('organisation_not_found')
          ? HektorErrorCode.NotFound
          : error.message.includes('contract_period_overlap')
            ? HektorErrorCode.Conflict
            : HektorErrorCode.InternalServerError,
        {
          message: error.message.includes('organisation_not_found')
            ? 'Organisation not found'
            : error.message.includes('contract_period_overlap')
              ? 'Contract periods cannot overlap'
              : 'Unable to create contract period',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return getOrganisationContractPeriod({
      organisationId: params.organisationId,
      contractPeriodId: data.id,
    });
  }

  async function updateOrganisationContractPeriod(
    params: UpdateOrganisationContractPeriodParams,
    body: UpdateOrganisationContractPeriodBody,
  ): Promise<UpdateOrganisationContractPeriodResponse> {
    const { error } = await updateOrganisationContractPeriodQuery(client, {
      ...body,
      ...params,
    });

    if (error) {
      const conflict =
        error.message.includes('contract_period_conflict') ||
        error.message.includes('contract_period_overlap');
      throw createServiceError(
        error.message.includes('contract_period_not_found') ||
          error.message.includes('organisation_not_found')
          ? HektorErrorCode.NotFound
          : conflict
            ? HektorErrorCode.Conflict
            : error.message.includes('learner_seat_allowance_below_usage')
              ? HektorErrorCode.UnprocessableEntity
              : HektorErrorCode.InternalServerError,
        {
          message: error.message.includes('contract_period_not_found')
            ? 'Contract period not found'
            : error.message.includes('organisation_not_found')
              ? 'Organisation not found'
              : error.message.includes('contract_period_overlap')
                ? 'Contract periods cannot overlap'
                : error.message.includes('contract_period_conflict')
                  ? 'The contract period changed while you were editing it'
                  : error.message.includes('learner_seat_allowance_below_usage')
                    ? 'Learner seat allowance cannot be lower than current usage'
                    : 'Unable to update contract period',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return getOrganisationContractPeriod(params);
  }

  async function listOrganisationCohorts(
    params: ListOrganisationCohortsParams,
    query: ListOrganisationCohortsQuery,
  ): Promise<ListOrganisationCohortsResponse> {
    const { data, error, count } = await buildOrganisationCohortsQuery(
      client,
      params.organisationId,
      query,
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list organisation cohorts',
        internalMessage: error.message,
        cause: error,
      });
    }

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: count ?? 0,
        sort: { order: query.order, dir: query.dir },
      },
      data: data.map(mapOrganisationCohortSummary),
    };
  }

  async function getOrganisationCohort(
    params: GetOrganisationCohortParams,
  ): Promise<GetOrganisationCohortResponse> {
    const { data, error } = await buildOrganisationCohortDetailQuery(
      client,
      params.organisationId,
      params.cohortId,
    );

    if (error) {
      throw createServiceError(
        error.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === 'PGRST116'
              ? 'Organisation cohort not found'
              : 'Unable to get organisation cohort',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    const learners = await Promise.all(
      data.memberships
        .filter((membership) => membership.role === OrganisationRole.Learner)
        .map(async (membership) => {
          const { data: authData, error: authError } =
            await client.auth.admin.getUserById(membership.user_id);
          if (authError) {
            throw createServiceError(HektorErrorCode.InternalServerError, {
              message: 'Unable to get organisation cohort',
              internalMessage: authError.message,
              cause: authError,
            });
          }
          return mapOrganisationMembershipUserSummary(
            membership,
            mapUserSummary(authData.user),
          );
        }),
    );

    return { data: mapOrganisationCohort(data, learners) };
  }

  async function createOrganisationCohort(
    params: CreateOrganisationCohortParams,
    body: CreateOrganisationCohortBody,
  ): Promise<CreateOrganisationCohortResponse> {
    const { data, error } = await createOrganisationCohortQuery(client, {
      ...body,
      organisationId: params.organisationId,
    });

    if (error) {
      throw createServiceError(
        error.message.includes('organisation_not_found')
          ? HektorErrorCode.NotFound
          : error.code === '23505'
            ? HektorErrorCode.Conflict
            : HektorErrorCode.InternalServerError,
        {
          message: error.message.includes('organisation_not_found')
            ? 'Organisation not found'
            : error.code === '23505'
              ? 'A cohort with this name and start date already exists'
              : 'Unable to create cohort',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return getOrganisationCohort({
      organisationId: params.organisationId,
      cohortId: data.id,
    });
  }

  async function updateOrganisationCohort(
    params: UpdateOrganisationCohortParams,
    body: UpdateOrganisationCohortBody,
  ): Promise<UpdateOrganisationCohortResponse> {
    const { error } = await updateOrganisationCohortQuery(client, {
      ...body,
      ...params,
    });

    if (error) {
      throw createServiceError(
        error.message.includes('cohort_not_found') ||
          error.message.includes('organisation_not_found')
          ? HektorErrorCode.NotFound
          : error.message.includes('cohort_conflict') || error.code === '23505'
            ? HektorErrorCode.Conflict
            : HektorErrorCode.InternalServerError,
        {
          message: error.message.includes('cohort_not_found')
            ? 'Organisation cohort not found'
            : error.message.includes('organisation_not_found')
              ? 'Organisation not found'
              : error.code === '23505'
                ? 'A cohort with this name and start date already exists'
                : error.message.includes('cohort_conflict')
                  ? 'The cohort changed while you were editing it'
                  : 'Unable to update cohort',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return getOrganisationCohort(params);
  }

  async function listOrganisationGroups(
    params: ListOrganisationGroupsParams,
    query: ListOrganisationGroupsQuery,
  ): Promise<ListOrganisationGroupsResponse> {
    const { data, error, count } = await buildOrganisationGroupsQuery(
      client,
      params.organisationId,
      query,
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list organisation groups',
        internalMessage: error.message,
        cause: error,
      });
    }

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: count ?? 0,
        sort: { order: query.order, dir: query.dir },
      },
      data: data.map(mapOrganisationGroupSummary),
    };
  }

  async function getOrganisationGroup(
    params: GetOrganisationGroupParams,
  ): Promise<GetOrganisationGroupResponse> {
    const { data, error } = await buildOrganisationGroupDetailQuery(
      client,
      params.organisationId,
      params.groupId,
    );

    if (error) {
      throw createServiceError(
        error.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === 'PGRST116'
              ? 'Organisation group not found'
              : 'Unable to get organisation group',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    const users = await Promise.all(
      data.userLinks.map(async ({ membership }) => {
        const { data: authData, error: authError } =
          await client.auth.admin.getUserById(membership.user_id);
        if (authError) {
          throw createServiceError(HektorErrorCode.InternalServerError, {
            message: 'Unable to get organisation group',
            internalMessage: authError.message,
            cause: authError,
          });
        }
        return mapOrganisationMembershipUserSummary(
          membership,
          mapUserSummary(authData.user),
        );
      }),
    );

    return { data: mapOrganisationGroup(data, users) };
  }

  async function createOrganisationGroup(
    params: CreateOrganisationGroupParams,
    body: CreateOrganisationGroupBody,
  ): Promise<CreateOrganisationGroupResponse> {
    const { data, error } = await createOrganisationGroupQuery(client, {
      ...body,
      organisationId: params.organisationId,
    });

    if (error) {
      const notFound =
        error.message.includes('organisation_not_found') ||
        error.message.includes('cohort_not_found');
      throw createServiceError(
        notFound
          ? HektorErrorCode.NotFound
          : error.code === '23505'
            ? HektorErrorCode.Conflict
            : HektorErrorCode.InternalServerError,
        {
          message: notFound
            ? error.message.includes('cohort_not_found')
              ? 'Organisation cohort not found'
              : 'Organisation not found'
            : error.code === '23505'
              ? 'A group with this name already exists'
              : 'Unable to create group',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return getOrganisationGroup({
      organisationId: params.organisationId,
      groupId: data.id,
    });
  }

  async function updateOrganisationGroup(
    params: UpdateOrganisationGroupParams,
    body: UpdateOrganisationGroupBody,
  ): Promise<UpdateOrganisationGroupResponse> {
    const { error } = await updateOrganisationGroupQuery(client, {
      ...body,
      ...params,
    });

    if (error) {
      const notFound =
        error.message.includes('group_not_found') ||
        error.message.includes('organisation_not_found') ||
        error.message.includes('cohort_not_found');
      throw createServiceError(
        notFound
          ? HektorErrorCode.NotFound
          : error.message.includes('group_conflict') || error.code === '23505'
            ? HektorErrorCode.Conflict
            : HektorErrorCode.InternalServerError,
        {
          message: error.message.includes('group_not_found')
            ? 'Organisation group not found'
            : error.message.includes('cohort_not_found')
              ? 'Organisation cohort not found'
              : error.message.includes('organisation_not_found')
                ? 'Organisation not found'
                : error.code === '23505'
                  ? 'A group with this name already exists'
                  : error.message.includes('group_conflict')
                    ? 'The group changed while you were editing it'
                    : 'Unable to update group',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return getOrganisationGroup(params);
  }

  async function updateOrganisationGroupMembership(
    params: UpdateOrganisationGroupMembershipParams,
    body: UpdateOrganisationGroupMembershipBody,
  ): Promise<UpdateOrganisationGroupMembershipResponse> {
    const { error } = await updateOrganisationGroupMembershipQuery(client, {
      ...body,
      ...params,
    });

    if (error) {
      const notFound =
        error.message.includes('group_not_found') ||
        error.message.includes('organisation_user_not_found') ||
        error.message.includes('pending_provision_not_found') ||
        error.message.includes('group_membership_not_found');
      const conflict =
        error.message.includes('group_membership_exists') ||
        error.message.includes('archived_group_is_read_only') ||
        error.message.includes('externally_managed_group_is_read_only');
      throw createServiceError(
        notFound
          ? HektorErrorCode.NotFound
          : conflict
            ? HektorErrorCode.Conflict
            : HektorErrorCode.InternalServerError,
        {
          message: error.message.includes('archived_group_is_read_only')
            ? 'Archived groups are read-only'
            : error.message.includes('externally_managed_group_is_read_only')
              ? 'Membership of externally managed groups is controlled by the provisioning source'
              : error.message.includes('group_membership_exists')
                ? 'This user is already in the group'
                : error.message.includes('pending_provision_not_found')
                  ? 'Pending provision not found'
                  : error.message.includes('organisation_user_not_found')
                    ? 'Organisation user not found'
                    : error.message.includes('group_membership_not_found')
                      ? 'Group membership not found'
                      : error.message.includes('group_not_found')
                        ? 'Organisation group not found'
                        : 'Unable to update group membership',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return getOrganisationGroup(params);
  }

  async function listOrganisationUserProvisions(
    params: ListOrganisationUserProvisionsParams,
    query: ListOrganisationUserProvisionsQuery,
  ): Promise<ListOrganisationUserProvisionsResponse> {
    const { data, error } = await buildOrganisationUserProvisionsQuery(
      client,
      params.organisationId,
      {
        provisioningMethod: query.provisioningMethod,
        role: query.role,
        status: query.status,
      },
    );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list provisioned users',
        internalMessage: error.message,
        cause: error,
      });
    }

    const provisions = data
      .map(mapOrganisationUserProvision)
      .filter((item) =>
        includesQuery(
          [item.provisionedDisplayName, item.provisionedUserName],
          query.query,
        ),
      );
    const direction = query.dir === 'asc' ? 1 : -1;
    provisions.sort((left, right) => {
      const leftValue =
        query.order === 'role'
          ? left.provisionedRole
          : (left.provisionedDisplayName ?? left.provisionedUserName);
      const rightValue =
        query.order === 'role'
          ? right.provisionedRole
          : (right.provisionedDisplayName ?? right.provisionedUserName);
      return leftValue.localeCompare(rightValue) * direction;
    });

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: provisions.length,
        sort: { order: query.order, dir: query.dir },
      },
      data: paginate(provisions, query.page, query.pageSize),
    };
  }

  async function previewOrganisationProvisionImport(
    params: PreviewOrganisationProvisionImportParams,
    body: PreviewOrganisationProvisionImportBody,
  ): Promise<PreviewOrganisationProvisionImportResponse> {
    const [organisation, cohorts, provisions, memberships] =
      await buildOrganisationProvisionImportContextQuery(
        client,
        params.organisationId,
      );
    const contextError =
      organisation.error ??
      cohorts.error ??
      provisions.error ??
      memberships.error;

    if (contextError || !organisation.data) {
      throw createServiceError(
        organisation.error?.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message: organisation.error
            ? 'Organisation not found'
            : 'Unable to review provision import',
          internalMessage: contextError?.message,
          cause: contextError,
        },
      );
    }
    if (organisation.data.status !== OrganisationStatus.Active) {
      throw createServiceError(HektorErrorCode.Conflict, {
        message: 'Only active organisations can import provisioned users',
      });
    }

    const authUsers = await listAllAuthUsers(client);
    const usersByEmail = new Map(
      authUsers
        .filter((user) => user.email)
        .map((user) => [user.email!.trim().toLocaleLowerCase(), user]),
    );
    const memberUserIds = new Set(
      (memberships.data ?? []).map((membership) => membership.user_id),
    );
    const provisionEmails = new Set(
      (provisions.data ?? []).map((provision) =>
        provision.provisioned_user_name.trim().toLocaleLowerCase(),
      ),
    );
    const cohortsByName = new Map<
      string,
      Array<{ id: string; status: string }>
    >();
    for (const cohort of cohorts.data ?? []) {
      const name = cohort.name.trim().toLocaleLowerCase();
      cohortsByName.set(name, [...(cohortsByName.get(name) ?? []), cohort]);
    }
    const duplicateEmails = new Set<string>();
    const seenEmails = new Set<string>();
    for (const row of body.rows) {
      const email = row.email.trim().toLocaleLowerCase();
      if (seenEmails.has(email)) duplicateEmails.add(email);
      seenEmails.add(email);
    }

    const rows = body.rows.map((row) => {
      const email = row.email.trim().toLocaleLowerCase();
      const matchingCohorts = row.cohortName
        ? (cohortsByName.get(row.cohortName.trim().toLocaleLowerCase()) ?? [])
        : [];
      if (duplicateEmails.has(email)) {
        return {
          ...row,
          action: OrganisationProvisionImportAction.Invalid,
          message: 'Email appears more than once in this file',
        };
      }
      if (row.cohortName && matchingCohorts.length === 0) {
        return {
          ...row,
          action: OrganisationProvisionImportAction.Invalid,
          message: `Cohort “${row.cohortName}” was not found`,
        };
      }
      if (matchingCohorts.length > 1) {
        return {
          ...row,
          action: OrganisationProvisionImportAction.Invalid,
          message: `Cohort “${row.cohortName}” is ambiguous`,
        };
      }
      if (
        matchingCohorts[0]?.status !== undefined &&
        matchingCohorts[0].status !== 'active'
      ) {
        return {
          ...row,
          action: OrganisationProvisionImportAction.Invalid,
          message: `Cohort “${row.cohortName}” is archived`,
        };
      }
      if (provisionEmails.has(email)) {
        return {
          ...row,
          action: OrganisationProvisionImportAction.AlreadyProvisioned,
          message: 'An active provision already exists',
        };
      }
      const user = usersByEmail.get(email);
      if (!user) {
        return {
          ...row,
          action: OrganisationProvisionImportAction.CreateProvision,
          message: 'Will create a pending provision',
        };
      }
      return {
        ...row,
        action: memberUserIds.has(user.id)
          ? OrganisationProvisionImportAction.AlreadyConnected
          : OrganisationProvisionImportAction.LinkExistingUser,
        message: memberUserIds.has(user.id)
          ? 'Will record this provision against the existing organisation user'
          : 'Will connect the existing Hektor user automatically',
      };
    });

    return {
      data: {
        rows,
        summary: {
          errors: rows.filter(
            (row) => row.action === OrganisationProvisionImportAction.Invalid,
          ).length,
          ready: rows.filter(
            (row) =>
              row.action !== OrganisationProvisionImportAction.Invalid &&
              row.action !==
                OrganisationProvisionImportAction.AlreadyProvisioned,
          ).length,
          unchanged: rows.filter(
            (row) =>
              row.action ===
              OrganisationProvisionImportAction.AlreadyProvisioned,
          ).length,
        },
      },
    };
  }

  async function commitOrganisationProvisionImport(
    params: CommitOrganisationProvisionImportParams,
    body: CommitOrganisationProvisionImportBody,
    sendInvitation?: (provisionId: string) => Promise<unknown>,
  ): Promise<CommitOrganisationProvisionImportResponse> {
    const preview = await previewOrganisationProvisionImport(params, body);
    if (preview.data.summary.errors > 0) {
      throw createServiceError(HektorErrorCode.BadRequest, {
        message: 'Resolve the import errors before continuing',
      });
    }

    const cohortData = await client
      .from('organisation_cohorts')
      .select('id, name')
      .eq('organisation_id', params.organisationId);
    if (cohortData.error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to import provisioned users',
        cause: cohortData.error,
      });
    }
    const cohortIds = new Map(
      cohortData.data.map((cohort) => [
        cohort.name.trim().toLocaleLowerCase(),
        cohort.id,
      ]),
    );
    const rowsToImport = preview.data.rows
      .filter(
        (row) =>
          row.action !== OrganisationProvisionImportAction.AlreadyProvisioned,
      )
      .map((row) => ({
        cohortId: row.cohortName
          ? cohortIds.get(row.cohortName.trim().toLocaleLowerCase())
          : undefined,
        email: row.email.trim().toLocaleLowerCase(),
        firstName: row.firstName.trim(),
        lastName: row.lastName.trim(),
        role: row.role,
        rowNumber: row.rowNumber,
      }));

    let imported: Array<{
      import_action: string;
      provision_id: string;
      row_number: number;
    }> = [];
    if (rowsToImport.length > 0) {
      const result = await importOrganisationUserProvisionsQuery(
        client,
        params.organisationId,
        rowsToImport,
      );
      if (result.error) {
        throw createServiceError(
          result.error.message.includes('seat_capacity')
            ? HektorErrorCode.Conflict
            : HektorErrorCode.InternalServerError,
          {
            message: result.error.message.includes('seat_capacity')
              ? 'There are not enough learner seats for this import'
              : 'Unable to import provisioned users',
            internalMessage: result.error.message,
            cause: result.error,
          },
        );
      }
      imported = result.data;
    }

    let invitationsSent = 0;
    let invitationsFailed = 0;
    if (body.sendInvitations && sendInvitation) {
      const pendingIds = imported
        .filter(
          (row) =>
            row.import_action ===
            OrganisationProvisionImportAction.CreateProvision,
        )
        .map((row) => row.provision_id);
      const outcomes = await Promise.allSettled(
        pendingIds.map((provisionId) => sendInvitation(provisionId)),
      );
      invitationsSent = outcomes.filter(
        (outcome) => outcome.status === 'fulfilled',
      ).length;
      invitationsFailed = outcomes.length - invitationsSent;
    }

    return {
      data: {
        created: imported.filter(
          (row) =>
            row.import_action ===
            OrganisationProvisionImportAction.CreateProvision,
        ).length,
        invitationsFailed,
        invitationsSent,
        linked: imported.filter(
          (row) =>
            row.import_action ===
              OrganisationProvisionImportAction.LinkExistingUser ||
            row.import_action ===
              OrganisationProvisionImportAction.AlreadyConnected,
        ).length,
        unchanged:
          preview.data.summary.unchanged +
          imported.filter(
            (row) =>
              row.import_action ===
              OrganisationProvisionImportAction.AlreadyProvisioned,
          ).length,
      },
    };
  }

  async function getOrganisationUserProvision(
    params: GetOrganisationUserProvisionParams,
  ): Promise<GetOrganisationUserProvisionResponse> {
    const { data, error } = await buildOrganisationUserProvisionDetailQuery(
      client,
      params.organisationId,
      params.provisionId,
    );

    if (error) {
      throw createServiceError(
        error.code === 'PGRST116'
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.code === 'PGRST116'
              ? 'Provisioned user not found'
              : 'Unable to get provisioned user',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    let linkedUser;
    if (data.membership) {
      const { data: authData, error: authError } =
        await client.auth.admin.getUserById(data.membership.user_id);
      if (authError) {
        throw createServiceError(HektorErrorCode.InternalServerError, {
          message: 'Unable to get provisioned user',
          internalMessage: authError.message,
          cause: authError,
        });
      }
      linkedUser = mapUserSummary(authData.user);
    }

    return { data: mapOrganisationUserProvisionDetail(data, linkedUser) };
  }

  return {
    acceptOrganisationUserProvision,
    autoLinkOrganisationUserProvision,
    createOrganisation,
    createOrganisationContractPeriod,
    createOrganisationCohort,
    createOrganisationGroup,
    createOrganisationMemberships,
    createOrganisationUser,
    commitOrganisationProvisionImport,
    getOrganisationContractPeriod,
    getOrganisationCohort,
    getOrganisationGroup,
    getOrganisationMembership,
    getOrganisation,
    getOrganisationUserProvision,
    getProvisionAcceptance,
    listOrganisationCohorts,
    listOrganisationGroups,
    listOrganisationMembershipCandidates,
    listOrganisationContractPeriods,
    listOrganisations,
    listOrganisationUserProvisions,
    previewOrganisationProvisionImport,
    listOrganisationUsers,
    transitionOrganisationUserProvision,
    updateOrganisation,
    updateOrganisationContractPeriod,
    updateOrganisationCohort,
    updateOrganisationGroup,
    updateOrganisationGroupMembership,
    updateOrganisationMembership,
  };
}
