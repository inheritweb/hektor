import { NextResponse, type NextRequest } from 'next/server';
import { createScimSimulatorService } from '@hektor/services/simulator';

import { env } from '@/env';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const action = (await request.formData()).get('action');
  const simulatorUrl = new URL('/', env.SIMULATOR_BASE_URL);
  const service = createScimSimulatorService({
    webBaseUrl: env.PUBLIC_BASE_URL,
  });

  try {
    if (action === 'provision') {
      await service.provisionUser();
      simulatorUrl.searchParams.set('notice', 'scim-user-provisioned');
    } else if (action === 'deactivate') {
      await service.deactivateUser();
      simulatorUrl.searchParams.set('notice', 'scim-user-deactivated');
    } else if (action === 'provision-group') {
      await service.synchronizeGroup(true);
      simulatorUrl.searchParams.set('notice', 'scim-group-provisioned');
    } else if (action === 'empty-group') {
      await service.synchronizeGroup(false);
      simulatorUrl.searchParams.set('notice', 'scim-group-emptied');
    } else if (action === 'delete-group') {
      await service.deleteGroup();
      simulatorUrl.searchParams.set('notice', 'scim-group-deleted');
    } else {
      simulatorUrl.searchParams.set('error', 'invalid-scim-action');
    }
  } catch (error) {
    simulatorUrl.searchParams.set('error', 'scim-request-failed');
    if (error instanceof Error) {
      simulatorUrl.searchParams.set('detail', error.message);
    }
  }

  return NextResponse.redirect(simulatorUrl, 303);
}
