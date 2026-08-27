import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrganisationRole, ProvisioningMethod } from '@hektor/types';

import { OrganisationInvitationManagerSheet } from './OrganisationInvitationManagerSheet.component';

describe('OrganisationInvitationManagerSheet', () => {
  it('selects all matching pending provisions for a bulk invitation', async () => {
    const onSend = vi.fn();
    render(
      <OrganisationInvitationManagerSheet
        candidates={[
          {
            email: 'ada@example.com',
            id: 'c65a9c98-edeb-483f-9356-aec3806623d1',
            name: 'Ada Lovelace',
            provisioningMethod: ProvisioningMethod.Csv,
            role: OrganisationRole.Learner,
          },
        ]}
        onFilterChange={() => undefined}
        onOpenChange={() => undefined}
        onPageChange={() => undefined}
        onSend={onSend}
        open
        page={1}
        pageSize={1}
        query=""
        totalRecords={3}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Select all on this page'));
    await user.click(
      screen.getByRole('button', {
        name: 'Select all 3 matching provisioned users',
      }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Send 3 invitations' }),
    );

    expect(onSend).toHaveBeenCalledWith({
      ids: undefined,
      selectAllMatching: true,
    });
  });
});
