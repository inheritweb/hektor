import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProvisionAcceptancePage } from './ProvisionAcceptancePage.component';

describe('ProvisionAcceptancePage', () => {
  it('confirms the organisation and accepts deliberately', async () => {
    const onAccept = vi.fn();
    render(
      <ProvisionAcceptancePage
        onAccept={onAccept}
        onDecline={vi.fn()}
        organisationName="Northbridge University"
        provisionedRole="learner"
        provisionedUserName="learner@northbridge.example"
      />,
    );

    expect(screen.getByText(/about to accept an invitation/)).toBeTruthy();
    await userEvent.click(
      screen.getByRole('button', { name: 'Join Northbridge University' }),
    );
    expect(onAccept).toHaveBeenCalledOnce();
  });
});
