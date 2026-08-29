import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrganisationRole } from '@hektor/types';

import { OrganisationMembershipCreateSheet } from './OrganisationMembershipCreateSheet.component';

describe('OrganisationMembershipCreateSheet', () => {
  it('selects canonical users and submits shared membership settings', async () => {
    const onSave = vi.fn();
    render(
      <OrganisationMembershipCreateSheet
        candidates={[
          { id: 'user-1', title: 'Priya Shah', email: 'priya@example.test' },
          {
            id: 'user-2',
            title: 'Isla Phillips',
            pendingProvisionRole: OrganisationRole.Learner,
          },
        ]}
        cohorts={[]}
        onOpenChange={vi.fn()}
        onPageChange={vi.fn()}
        onSave={onSave}
        onSearchChange={vi.fn()}
        open
        page={1}
        pageSize={20}
        search=""
        totalRecords={2}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Select all 2 on this page'));
    await user.click(screen.getByRole('button', { name: 'Connect users' }));

    expect(screen.getByText('Pending provision · learner')).toBeTruthy();
    expect(onSave).toHaveBeenCalledWith({
      cohortId: undefined,
      role: OrganisationRole.Learner,
      userIds: ['user-1', 'user-2'],
    });
  });
});
