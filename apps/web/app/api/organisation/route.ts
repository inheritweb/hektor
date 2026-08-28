import {
  getTenantOrganisationContextContract,
  organisationSummarySchema,
} from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';

export const GET = registerEndpoint(
  getTenantOrganisationContextContract,
  async (_input, { supabase, tenant }) => {
    const { data, error } = await supabase
      .from('organisations')
      .select('id, name, slug, status')
      .eq('id', tenant.organisationId)
      .single();

    if (error) throw error;

    return {
      data: {
        accessMode: tenant.mode,
        organisation: organisationSummarySchema.parse(data),
        ...(tenant.role ? { role: tenant.role } : {}),
      },
    };
  },
);
