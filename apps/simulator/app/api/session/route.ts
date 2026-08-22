import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

import {
  createSimulatorService,
  simulatorScenarios,
} from '@hektor/services/simulator';

import { env } from '@/env';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function redirectUrl(destination: 'simulator' | 'web', path: string) {
  return new URL(
    path,
    destination === 'simulator' ? env.SIMULATOR_BASE_URL : env.PUBLIC_BASE_URL,
  );
}

async function service() {
  return createSimulatorService({
    adminClient: createAdminSupabaseClient(),
    sessionClient: await createServerSupabaseClient(),
  });
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const scenarioId = (await request.formData()).get('scenarioId');
  const scenario = simulatorScenarios.find(
    (candidate) => candidate.id === scenarioId,
  );

  if (!scenario) {
    return NextResponse.redirect(
      redirectUrl('simulator', '/?error=invalid-scenario'),
      303,
    );
  }

  try {
    const result = await (
      await service()
    ).startScenario({
      identityEmail: scenario.email,
      institutionName: scenario.institutionName,
      mode: scenario.mode,
    });
    return NextResponse.redirect(
      redirectUrl(result.destination, result.path),
      303,
    );
  } catch {
    return NextResponse.redirect(
      redirectUrl('simulator', '/?error=session-setup-failed'),
      303,
    );
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const provisionId = request.nextUrl.searchParams.get('provisionId');
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null;

  if (!provisionId || !tokenHash || !type) {
    return NextResponse.redirect(
      redirectUrl('simulator', '/?error=invalid-invitation'),
    );
  }

  try {
    const result = await (
      await service()
    ).acceptInvitationToken({ provisionId, tokenHash, type });
    return NextResponse.redirect(redirectUrl(result.destination, result.path));
  } catch {
    return NextResponse.redirect(
      redirectUrl('simulator', '/?error=invalid-invitation'),
    );
  }
}
