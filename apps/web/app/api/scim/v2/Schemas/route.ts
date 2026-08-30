import { SCIM_GROUP_SCHEMA, SCIM_USER_SCHEMA } from '@hektor/types';

import { scimResponse, withScim } from '@/lib/scim/route-handler';

const SCHEMA_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:Schema';

const LIST_RESPONSE_SCHEMA =
  'urn:ietf:params:scim:api:messages:2.0:ListResponse';

export function GET(request: Request) {
  return withScim(request, async ({ baseUrl }) => {
    const resources = [
      {
        attributes: [
          {
            multiValued: false,
            name: 'userName',
            required: true,
            type: 'string',
            uniqueness: 'server',
          },
          {
            multiValued: false,
            name: 'displayName',
            required: false,
            type: 'string',
          },
          {
            multiValued: false,
            name: 'active',
            required: false,
            type: 'boolean',
          },
        ],
        description: 'Hektor SCIM user',
        id: SCIM_USER_SCHEMA,
        meta: {
          location: `${baseUrl}/Schemas/${encodeURIComponent(SCIM_USER_SCHEMA)}`,
          resourceType: 'Schema',
        },
        name: 'User',
        schemas: [SCHEMA_SCHEMA],
      },
      {
        attributes: [
          {
            multiValued: false,
            name: 'displayName',
            required: true,
            type: 'string',
          },
          {
            multiValued: true,
            name: 'members',
            required: false,
            type: 'complex',
          },
        ],
        description: 'Hektor SCIM group',
        id: SCIM_GROUP_SCHEMA,
        meta: {
          location: `${baseUrl}/Schemas/${encodeURIComponent(SCIM_GROUP_SCHEMA)}`,
          resourceType: 'Schema',
        },
        name: 'Group',
        schemas: [SCHEMA_SCHEMA],
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
