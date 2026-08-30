import { afterEach, describe, expect, it, vi } from 'vitest';

import { SCIM_LIST_RESPONSE_SCHEMA, SCIM_USER_SCHEMA } from '@hektor/types';

import {
  createScimSimulatorService,
  simulatorScimUser,
} from './scim-simulator.service';

describe('SCIM simulator service', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('discovers then provisions through the public SCIM HTTP boundary', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          Resources: [],
          itemsPerPage: 0,
          schemas: [SCIM_LIST_RESPONSE_SCHEMA],
          startIndex: 1,
          totalResults: 0,
        }),
      )
      .mockResolvedValueOnce(Response.json(scimUser()));
    vi.stubGlobal('fetch', fetchMock);

    await createScimSimulatorService({
      webBaseUrl: 'http://localhost:3000',
    }).provisionUser();

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/api/scim/v2/Users',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toMatchObject({
      authorization: 'Bearer hektor_scim_simulator_local_only_2026',
    });
  });
});

function scimUser() {
  return {
    active: true,
    displayName: simulatorScimUser.displayName,
    externalId: simulatorScimUser.externalId,
    id: 'c65a9c98-edeb-483f-9356-aec3806623d1',
    meta: {
      created: '2026-08-30T00:00:00.000Z',
      lastModified: '2026-08-30T00:00:00.000Z',
      location:
        'http://localhost:3000/api/scim/v2/Users/c65a9c98-edeb-483f-9356-aec3806623d1',
      resourceType: 'User',
    },
    schemas: [SCIM_USER_SCHEMA],
    userName: simulatorScimUser.email,
  };
}
