import type { EmailOtpType } from '@supabase/supabase-js';

import type { DatabaseClient } from '../database';

export const simulatorScenarios = [
  {
    id: 'new-user-sso',
    name: 'Grace Roberts',
    email: 'grace.roberts@northbridge.example',
    mode: 'sso',
    institutionName: 'Northbridge University',
    startingState:
      'No Hektor account. No organisation membership. Provisioned with SCIM. Institutional SSO is available.',
    action: 'Simulate institutional SSO',
    expected:
      'Hektor creates and logs into Grace’s account, then asks her to confirm joining Northbridge. The membership is created only after Join.',
  },
  {
    id: 'existing-user-sso',
    name: 'Isla Phillips',
    email: 'isla.phillips@northbridge.example',
    mode: 'sso',
    institutionName: 'Northbridge University',
    startingState:
      'Has a Hektor account. No organisation membership. Provisioned with SCIM. Institutional SSO is available.',
    action: 'Simulate institutional SSO',
    expected:
      'Hektor logs into Isla’s existing account, then asks her to confirm joining Northbridge. No duplicate account is created.',
  },
  {
    id: 'existing-member-sso',
    name: 'Maya Patel',
    email: 'maya.patel@northbridge.example',
    mode: 'sso',
    institutionName: 'Northbridge University',
    startingState:
      'Has a Hektor account and an organisation membership. Provisioned with SCIM. Institutional SSO is available.',
    action: 'Simulate institutional SSO',
    expected:
      'The provision is already linked to Maya’s existing membership. Hektor logs her in without another invitation or another membership.',
  },
  {
    id: 'unreserved-sso',
    name: 'Nora Hughes',
    email: 'nora.hughes@northbridge.example',
    mode: 'sso',
    institutionName: 'Northbridge University',
    startingState:
      'No Hektor account. No organisation membership. Not provisioned. Institutional SSO is available.',
    action: 'Simulate institutional SSO',
    expected:
      'Hektor refuses institutional access and explains that the organisation has not reserved a seat. No account or membership is created.',
  },
  {
    id: 'new-user-invitation',
    name: 'Harvey Reid',
    email: 'harvey.reid@northbridge.example',
    mode: 'invitation',
    institutionName: 'Northbridge University',
    startingState:
      'No Hektor account. No organisation membership. Provisioned with SCIM. Institutional SSO is unavailable.',
    action: 'Open tokenised invitation',
    expected:
      'The invitation token verifies Harvey’s email, creates and logs into his Hektor account, then asks him to confirm joining Northbridge.',
  },
] as const;

export type SimulatorScenario = (typeof simulatorScenarios)[number];

export interface SimulatorScenarioState {
  account: boolean;
  membership?: string;
  provision?: {
    id: string;
    status: string;
  };
  scenario: SimulatorScenario;
}

export interface SimulatorRedirect {
  destination: 'simulator' | 'web';
  path: string;
}

export function createSimulatorService({
  adminClient,
  sessionClient,
}: {
  adminClient: DatabaseClient;
  sessionClient: DatabaseClient;
}) {
  async function listScenarios(): Promise<SimulatorScenarioState[]> {
    const scenarioEmails = simulatorScenarios.map((scenario) => scenario.email);
    const [{ data: provisions, error: provisionError }, authResult] =
      await Promise.all([
        adminClient
          .from('organisation_user_provisions')
          .select('id, organisation_id, provisioned_user_name, status')
          .in('provisioned_user_name', scenarioEmails)
          .in('status', ['pending', 'linked']),
        adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      ]);

    if (provisionError) throw provisionError;
    if (authResult.error) throw authResult.error;

    const accountByEmail = new Map(
      authResult.data.users
        .filter((user) => user.email)
        .map((user) => [user.email!.trim().toLowerCase(), user]),
    );
    const accountIds = [...accountByEmail.values()].map((user) => user.id);
    const { data: memberships, error: membershipError } = accountIds.length
      ? await adminClient
          .from('organisation_users')
          .select('user_id, organisation_id, status')
          .in('user_id', accountIds)
      : { data: [], error: null };

    if (membershipError) throw membershipError;

    return simulatorScenarios.map((scenario) => {
      const account = accountByEmail.get(scenario.email.toLowerCase());
      const provision = provisions?.find(
        (candidate) => candidate.provisioned_user_name === scenario.email,
      );
      const membership = memberships?.find(
        (candidate) =>
          candidate.user_id === account?.id &&
          candidate.organisation_id === provision?.organisation_id,
      );

      return {
        account: Boolean(account),
        membership: membership?.status,
        provision: provision
          ? { id: provision.id, status: provision.status }
          : undefined,
        scenario,
      };
    });
  }

  async function startScenario(input: {
    identityEmail: string;
    institutionName: string;
    mode: 'invitation' | 'sso';
    provisionId?: string;
  }): Promise<SimulatorRedirect> {
    const provisionQuery = adminClient
      .from('organisation_user_provisions')
      .select('id, provisioned_user_name, status')
      .eq('provisioned_user_name', input.identityEmail);
    const { data: provision, error } = input.provisionId
      ? await provisionQuery.eq('id', input.provisionId).maybeSingle()
      : await provisionQuery.in('status', ['pending', 'linked']).maybeSingle();

    if (error) throw error;
    if (!provision) {
      return {
        destination: 'web',
        path: `/auth/institutional/access-unavailable?institution=${encodeURIComponent(input.institutionName)}`,
      };
    }
    if (input.mode === 'invitation' && provision.status !== 'pending') {
      throw new Error('invitation_not_pending');
    }

    const properties = await generateSessionToken(
      adminClient,
      provision.provisioned_user_name,
    );

    if (input.mode === 'invitation') {
      const query = new URLSearchParams({
        provisionId: provision.id,
        token_hash: properties.hashed_token,
        type: properties.verification_type,
      });
      return { destination: 'simulator', path: `/api/session?${query}` };
    }

    await verifySessionToken(
      sessionClient,
      properties.hashed_token,
      properties.verification_type,
    );

    return {
      destination: 'web',
      path:
        provision.status === 'pending'
          ? `/provisioning/accept/${encodeURIComponent(provision.id)}`
          : '/',
    };
  }

  async function acceptInvitationToken(input: {
    provisionId: string;
    tokenHash: string;
    type: EmailOtpType;
  }): Promise<SimulatorRedirect> {
    await verifySessionToken(sessionClient, input.tokenHash, input.type);

    return {
      destination: 'web',
      path: `/provisioning/accept/${encodeURIComponent(input.provisionId)}`,
    };
  }

  return { acceptInvitationToken, listScenarios, startScenario };
}

async function generateSessionToken(client: DatabaseClient, email: string) {
  let generated = await client.auth.admin.generateLink({
    email,
    type: 'magiclink',
  });

  if (generated.error) {
    const { error } = await client.auth.admin.createUser({
      email,
      email_confirm: true,
      password: crypto.randomUUID(),
    });
    if (error) throw error;
    generated = await client.auth.admin.generateLink({
      email,
      type: 'magiclink',
    });
  }

  if (generated.error) throw generated.error;
  if (!generated.data.properties?.hashed_token) {
    throw new Error('session_token_not_generated');
  }

  return generated.data.properties;
}

async function verifySessionToken(
  client: DatabaseClient,
  tokenHash: string,
  type: EmailOtpType,
) {
  const { error } = await client.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });
  if (error) throw error;
}
