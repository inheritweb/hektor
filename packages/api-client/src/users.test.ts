import { describe, expect, it, vi } from 'vitest';

import { SortDirection } from '@hektor/types/contracts';

import { Client } from './client';
import { getUser, listUsers } from './users';

describe('admin user API methods', () => {
  it('requests the paginated user directory', async () => {
    const response = {
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'createdAt', dir: SortDirection.Descending },
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
      listUsers(client, {
        query: {
          page: 1,
          pageSize: 20,
          order: 'createdAt',
          dir: SortDirection.Descending,
        },
      }),
    ).resolves.toEqual(response);
    expect(fetcher).toHaveBeenCalledWith(
      'https://hektor.test/api/admin/users?page=1&pageSize=20&order=createdAt&dir=desc',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('interpolates the user id for user detail', async () => {
    const userId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const response = {
      data: {
        id: userId,
        displayName: 'Alex Morgan',
        email: 'alex@example.com',
        identities: [],
        memberships: [],
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

    await expect(getUser(client, { params: { userId } })).resolves.toEqual(
      response,
    );
    expect(fetcher).toHaveBeenCalledWith(
      `https://hektor.test/api/admin/users/${userId}`,
      expect.objectContaining({ method: 'GET' }),
    );
  });
});
