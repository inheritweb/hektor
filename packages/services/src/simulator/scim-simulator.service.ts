import {
  SCIM_USER_SCHEMA,
  SCIM_GROUP_SCHEMA,
  type ScimGroup,
  type ScimListResponse,
  type ScimUser,
} from '@hektor/types';

export const simulatorScimUser = {
  displayName: 'Simulated SCIM Learner',
  email: 'simulated.scim.learner@northbridge.example',
  externalId: 'simulator-scim-learner',
  familyName: 'Learner',
  givenName: 'Simulated SCIM',
} as const;

export const simulatorScimGroup = {
  displayName: 'Simulated SCIM Cohort',
  externalId: 'simulator-scim-cohort',
} as const;

const localSimulatorToken = 'hektor_scim_simulator_local_only_2026';

export function createScimSimulatorService({
  webBaseUrl,
}: {
  webBaseUrl: string;
}) {
  const baseUrl = new URL('/api/scim/v2', webBaseUrl)
    .toString()
    .replace(/\/$/, '');

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        accept: 'application/scim+json',
        authorization: `Bearer ${localSimulatorToken}`,
        ...(init?.body ? { 'content-type': 'application/scim+json' } : {}),
        ...init?.headers,
      },
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => undefined)) as
        { detail?: string } | undefined;
      throw new Error(
        body?.detail ?? `SCIM request failed (${response.status})`,
      );
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  async function getUser(): Promise<ScimUser | undefined> {
    const filter = encodeURIComponent(
      `userName eq "${simulatorScimUser.email}"`,
    );
    const result = await request<ScimListResponse<ScimUser>>(
      `/Users?filter=${filter}`,
    );
    return result.Resources[0];
  }

  async function getGroup(): Promise<ScimGroup | undefined> {
    const filter = encodeURIComponent(
      `displayName eq "${simulatorScimGroup.displayName}"`,
    );
    const result = await request<ScimListResponse<ScimGroup>>(
      `/Groups?filter=${filter}`,
    );
    return result.Resources[0];
  }

  async function provisionUser() {
    const current = await getUser();
    const input = {
      active: true,
      displayName: simulatorScimUser.displayName,
      externalId: simulatorScimUser.externalId,
      name: {
        familyName: simulatorScimUser.familyName,
        givenName: simulatorScimUser.givenName,
      },
      schemas: [SCIM_USER_SCHEMA],
      userName: simulatorScimUser.email,
    };
    return request<ScimUser>(current ? `/Users/${current.id}` : '/Users', {
      body: JSON.stringify(input),
      method: current ? 'PUT' : 'POST',
    });
  }

  async function deactivateUser() {
    const current = await getUser();
    if (!current)
      throw new Error('The simulated SCIM user has not been provisioned');
    return request<ScimUser>(`/Users/${current.id}`, {
      body: JSON.stringify({
        Operations: [{ op: 'replace', path: 'active', value: false }],
        schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
      }),
      method: 'PATCH',
    });
  }

  async function synchronizeGroup(includeUser: boolean) {
    const user = await provisionUser();
    const current = await getGroup();
    const input = {
      displayName: simulatorScimGroup.displayName,
      externalId: simulatorScimGroup.externalId,
      members: includeUser
        ? [{ display: user.displayName, type: 'User', value: user.id }]
        : [],
      schemas: [SCIM_GROUP_SCHEMA],
    };
    return request<ScimGroup>(current ? `/Groups/${current.id}` : '/Groups', {
      body: JSON.stringify(input),
      method: current ? 'PUT' : 'POST',
    });
  }

  async function deleteGroup() {
    const current = await getGroup();
    if (!current)
      throw new Error('The simulated SCIM group has not been provisioned');
    await request<void>(`/Groups/${current.id}`, { method: 'DELETE' });
  }

  return {
    deactivateUser,
    deleteGroup,
    getGroup,
    getUser,
    provisionUser,
    synchronizeGroup,
  };
}
