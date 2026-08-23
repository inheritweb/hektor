import { describe, expect, it, vi } from 'vitest';

import {
  GroupStatus,
  OrganisationStatus,
  ProvisioningLifecycleAction,
  ProvisioningStatus,
} from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';

import { Client } from './client';
import {
  autoLinkOrganisationUserProvision,
  createOrganisationContractPeriod,
  createOrganisationCohort,
  getOrganisation,
  getOrganisationContractPeriod,
  getOrganisationCohort,
  getOrganisationUserProvision,
  listOrganisationContractPeriods,
  listOrganisationCohorts,
  listOrganisationGroups,
  listOrganisationUserProvisions,
  listOrganisations,
  listOrganisationUsers,
  transitionOrganisationUserProvision,
  updateOrganisationContractPeriod,
  updateOrganisationCohort,
} from './organisations';

describe('admin organisation API methods', () => {
  it('requests the paginated organisation directory', async () => {
    const response = {
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'name', dir: SortDirection.Ascending },
      },
      data: [],
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(response));
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });

    await expect(
      listOrganisations(client, {
        query: {
          page: 1,
          pageSize: 20,
          order: 'name',
          dir: SortDirection.Ascending,
        },
      }),
    ).resolves.toEqual(response);
    expect(fetcher).toHaveBeenCalledWith(
      'https://hektor.test/api/admin/organisations?page=1&pageSize=20&order=name&dir=asc',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('interpolates the organisation id for organisation detail', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const response = {
      data: {
        id: organisationId,
        name: 'Northbridge University',
        slug: 'northbridge-university',
        status: OrganisationStatus.Active,
        contractPeriods: [],
        cohorts: [],
        groups: [],
        usersSummary: {
          total: 0,
          learners: 0,
          tutors: 0,
          organisationAdmins: 0,
          suspended: 0,
        },
        userProvisionsSummary: {
          total: 0,
          pending: 0,
          inactive: 0,
          failed: 0,
        },
        createdAt: '2026-08-15T10:00:00.000Z',
        updatedAt: '2026-08-15T11:00:00.000Z',
      },
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(response));
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });

    await expect(
      getOrganisation(client, { params: { organisationId } }),
    ).resolves.toEqual(response);
    expect(fetcher).toHaveBeenCalledWith(
      `https://hektor.test/api/admin/organisations/${organisationId}`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('requests the paginated organisation user directory', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const response = {
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'displayName', dir: SortDirection.Ascending },
      },
      data: [],
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(response));
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });

    await expect(
      listOrganisationUsers(client, {
        params: { organisationId },
        query: {
          page: 1,
          pageSize: 20,
          order: 'displayName',
          dir: SortDirection.Ascending,
        },
      }),
    ).resolves.toEqual(response);
    expect(fetcher).toHaveBeenCalledWith(
      `https://hektor.test/api/admin/organisations/${organisationId}/users?page=1&pageSize=20&order=displayName&dir=asc`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('requests paginated organisation contract periods', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const response = {
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'startsOn', dir: SortDirection.Descending },
      },
      data: [],
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(response));
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });

    await expect(
      listOrganisationContractPeriods(client, {
        params: { organisationId },
        query: {
          page: 1,
          pageSize: 20,
          order: 'startsOn',
          dir: SortDirection.Descending,
        },
      }),
    ).resolves.toEqual(response);
    expect(fetcher).toHaveBeenCalledWith(
      `https://hektor.test/api/admin/organisations/${organisationId}/contract-periods?page=1&pageSize=20&order=startsOn&dir=desc`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('creates, gets and updates an organisation contract period', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const contractPeriodId = 'b7234776-87f7-480f-a710-1ce16b4a151d';
    const data = {
      id: contractPeriodId,
      startsOn: '2027-09-01',
      endsOn: '2028-09-01',
      seats: { allowed: 300, activated: 0, remaining: 300 },
      createdAt: '2026-08-23T10:00:00.000Z',
      updatedAt: '2026-08-23T10:00:00.000Z',
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => Response.json({ data }));
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });
    const path = `https://hektor.test/api/admin/organisations/${organisationId}/contract-periods`;

    await createOrganisationContractPeriod(client, {
      params: { organisationId },
      body: {
        startsOn: data.startsOn,
        endsOn: data.endsOn,
        learnerSeatAllowance: 300,
      },
    });
    await getOrganisationContractPeriod(client, {
      params: { organisationId, contractPeriodId },
    });
    await updateOrganisationContractPeriod(client, {
      params: { organisationId, contractPeriodId },
      body: {
        startsOn: data.startsOn,
        endsOn: data.endsOn,
        learnerSeatAllowance: 350,
        expectedUpdatedAt: data.updatedAt,
      },
    });

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      path,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      `${path}/${contractPeriodId}`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      3,
      `${path}/${contractPeriodId}`,
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('requests paginated organisation cohorts', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const response = {
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'startsOn', dir: SortDirection.Descending },
      },
      data: [],
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(response));
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });

    await expect(
      listOrganisationCohorts(client, {
        params: { organisationId },
        query: {
          page: 1,
          pageSize: 20,
          order: 'startsOn',
          dir: SortDirection.Descending,
        },
      }),
    ).resolves.toEqual(response);
    expect(fetcher).toHaveBeenCalledWith(
      `https://hektor.test/api/admin/organisations/${organisationId}/cohorts?page=1&pageSize=20&order=startsOn&dir=desc`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('creates and updates an organisation cohort', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const cohortId = 'b7234776-87f7-480f-a710-1ce16b4a151d';
    const data = {
      id: cohortId,
      name: 'September 2027',
      startsOn: '2027-09-01',
      endsOn: '2028-08-31',
      status: GroupStatus.Active,
      organisation: {
        id: organisationId,
        name: 'Northbridge University',
        slug: 'northbridge-university',
        status: OrganisationStatus.Active,
      },
      groups: [],
      learners: [],
      createdAt: '2026-08-23T10:00:00.000Z',
      updatedAt: '2026-08-23T10:00:00.000Z',
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => Response.json({ data }));
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });
    const path = `https://hektor.test/api/admin/organisations/${organisationId}/cohorts`;

    await createOrganisationCohort(client, {
      params: { organisationId },
      body: {
        name: data.name,
        startsOn: data.startsOn,
        endsOn: data.endsOn,
      },
    });
    await updateOrganisationCohort(client, {
      params: { organisationId, cohortId },
      body: {
        name: data.name,
        startsOn: data.startsOn,
        endsOn: data.endsOn,
        status: GroupStatus.Archived,
        expectedUpdatedAt: data.updatedAt,
      },
    });

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      path,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      `${path}/${cohortId}`,
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('interpolates organisation and cohort ids for cohort detail', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const cohortId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const response = {
      data: {
        id: cohortId,
        name: 'September 2026',
        startsOn: '2026-09-01',
        endsOn: '2029-08-31',
        status: 'active',
        organisation: {
          id: organisationId,
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
        },
        groups: [],
        learners: [],
        createdAt: '2026-08-16T10:00:00.000Z',
        updatedAt: '2026-08-16T10:00:00.000Z',
      },
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(response));
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });

    await expect(
      getOrganisationCohort(client, {
        params: { cohortId, organisationId },
      }),
    ).resolves.toEqual(response);
    expect(fetcher).toHaveBeenCalledWith(
      `https://hektor.test/api/admin/organisations/${organisationId}/cohorts/${cohortId}`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('requests paginated organisation groups', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const response = {
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'name', dir: SortDirection.Ascending },
      },
      data: [],
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(response));
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });

    await expect(
      listOrganisationGroups(client, {
        params: { organisationId },
        query: {
          page: 1,
          pageSize: 20,
          order: 'name',
          dir: SortDirection.Ascending,
        },
      }),
    ).resolves.toEqual(response);
    expect(fetcher).toHaveBeenCalledWith(
      `https://hektor.test/api/admin/organisations/${organisationId}/groups?page=1&pageSize=20&order=name&dir=asc`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('requests provisioned users independently', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const response = {
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'displayName', dir: SortDirection.Ascending },
      },
      data: [],
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(response));
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });

    await expect(
      listOrganisationUserProvisions(client, {
        params: { organisationId },
        query: {
          page: 1,
          pageSize: 20,
          order: 'displayName',
          dir: SortDirection.Ascending,
        },
      }),
    ).resolves.toEqual(response);
    expect(fetcher).toHaveBeenCalledWith(
      `https://hektor.test/api/admin/organisations/${organisationId}/user-provisions?page=1&pageSize=20&order=displayName&dir=asc`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('interpolates organisation and provision ids for provision detail', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const provisionId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const response = {
      data: {
        id: provisionId,
        organisation: {
          id: organisationId,
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
        },
        groups: [],
        invitationSendCount: 0,
        provisioningMethod: 'scim',
        provisionedUserName: 'maya@northbridge.example',
        provisionedRole: 'learner',
        status: 'pending',
        createdAt: '2026-08-15T10:00:00.000Z',
        updatedAt: '2026-08-15T10:00:00.000Z',
      },
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(response));
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });

    await expect(
      getOrganisationUserProvision(client, {
        params: { organisationId, provisionId },
      }),
    ).resolves.toEqual(response);
    expect(fetcher).toHaveBeenCalledWith(
      `https://hektor.test/api/admin/organisations/${organisationId}/user-provisions/${provisionId}`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('sends provision lifecycle mutations to their action endpoints', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const provisionId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({ data: { id: provisionId, status: 'inactive' } }),
      )
      .mockResolvedValueOnce(
        Response.json({ data: { outcome: 'pending_identity_verification' } }),
      );
    const client = new Client({
      baseUrl: 'https://hektor.test',
      fetch: fetcher,
    });

    await transitionOrganisationUserProvision(client, {
      params: { organisationId, provisionId },
      body: {
        action: ProvisioningLifecycleAction.Deactivate,
        expectedStatus: ProvisioningStatus.Linked,
      },
    });
    await autoLinkOrganisationUserProvision(client, {
      params: { organisationId, provisionId },
      body: {},
    });

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/lifecycle'),
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/auto-link'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
