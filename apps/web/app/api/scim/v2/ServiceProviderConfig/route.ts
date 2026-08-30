import { scimResponse, withScim } from '@/lib/scim/route-handler';

export function GET(request: Request) {
  return withScim(request, async ({ baseUrl }) =>
    scimResponse({
      authenticationSchemes: [
        {
          description: 'Organisation-scoped bearer token',
          name: 'Bearer Token',
          primary: true,
          specUri: 'https://www.rfc-editor.org/info/rfc6750',
          type: 'oauthbearertoken',
        },
      ],
      bulk: { maxOperations: 0, maxPayloadSize: 0, supported: false },
      changePassword: { supported: false },
      documentationUri: `${baseUrl.replace('/api/scim/v2', '')}/docs/org-admins/scim`,
      etag: { supported: false },
      filter: { maxResults: 100, supported: true },
      meta: {
        location: `${baseUrl}/ServiceProviderConfig`,
        resourceType: 'ServiceProviderConfig',
      },
      patch: { supported: true },
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
      sort: { supported: false },
    }),
  );
}
