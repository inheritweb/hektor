import { describe, expect, it, vi } from 'vitest';

import { OrganisationStatus } from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';

import { Client } from './client';
import {
  getOrganisation,
  listOrganisationContractPeriods,
  listOrganisationCohorts,
  listOrganisationUserProvisions,
  listOrganisations,
  listOrganisationUsers,
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
});
