import { SCIM_GROUP_SCHEMA, SCIM_USER_SCHEMA } from '@hektor/types';

import { scimResponse, withScim } from '@/lib/scim/route-handler';

const RESOURCE_TYPE_SCHEMA =
  'urn:ietf:params:scim:schemas:core:2.0:ResourceType';

const LIST_RESPONSE_SCHEMA =
  'urn:ietf:params:scim:api:messages:2.0:ListResponse';

export function GET(request: Request) {
  return withScim(request, async ({ baseUrl }) => {
    const resources = [
      {
        endpoint: '/Users',
        id: 'User',
        meta: {
          location: `${baseUrl}/ResourceTypes/User`,
          resourceType: 'ResourceType',
        },
        name: 'User',
        schema: SCIM_USER_SCHEMA,
        schemas: [RESOURCE_TYPE_SCHEMA],
      },
      {
        endpoint: '/Groups',
        id: 'Group',
        meta: {
          location: `${baseUrl}/ResourceTypes/Group`,
          resourceType: 'ResourceType',
        },
        name: 'Group',
        schema: SCIM_GROUP_SCHEMA,
        schemas: [RESOURCE_TYPE_SCHEMA],
      },
    ];
    return scimResponse({
      Resources: resources,
      itemsPerPage: resources.length,
      schemas: [LIST_RESPONSE_SCHEMA],
      startIndex: 1,
      totalResults: resources.length,
    });
  });
}
