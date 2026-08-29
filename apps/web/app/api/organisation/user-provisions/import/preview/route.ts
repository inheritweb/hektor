import { createOrganisationsService } from '@hektor/services/organisations';
import {
  OrganisationProvisionImportAction,
  TenantOrganisationProvisionImportAction,
} from '@hektor/types';
import { previewTenantOrganisationProvisionImportContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  previewTenantOrganisationProvisionImportContract,
  async ({ body }, { tenant }) => {
    const preview = await createOrganisationsService(
      createAdminSupabaseClient(),
    ).previewOrganisationProvisionImport(
      { organisationId: tenant.organisationId },
      body,
    );

    return {
      data: {
        rows: preview.data.rows.map((row) => {
          if (row.action === OrganisationProvisionImportAction.Invalid) {
            return {
              ...row,
              action: TenantOrganisationProvisionImportAction.Invalid,
            };
          }
          if (
            row.action === OrganisationProvisionImportAction.AlreadyProvisioned
          ) {
            return {
              ...row,
              action: TenantOrganisationProvisionImportAction.Unchanged,
              message: 'An active provision already exists',
            };
          }
          return {
            ...row,
            action: TenantOrganisationProvisionImportAction.Ready,
            message: 'Ready to process',
          };
        }),
        summary: preview.data.summary,
      },
    };
  },
);
