import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MembershipManagerSheet } from './MembershipManagerSheet.component';

describe('MembershipManagerSheet', () => {
  it('stages a page selection and submits a membership diff', () => {
    const onSave = vi.fn();
    render(
      <MembershipManagerSheet
        currentMemberIds={['member-1']}
        description="Choose users."
        emptyMessage="No users."
        items={[
          { id: 'member-1', title: 'Maya Patel' },
          { id: 'member-2', title: 'Sam Rivera' },
        ]}
        onOpenChange={vi.fn()}
        onPageChange={vi.fn()}
        onSave={onSave}
        onSearchChange={vi.fn()}
        open
        page={1}
        pageSize={20}
        search=""
        title="Manage users"
        totalRecords={2}
      />,
    );

    fireEvent.click(screen.getByLabelText('Select all 2 on this page'));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSave).toHaveBeenCalledWith({
      addIds: ['member-2'],
      removeIds: [],
    });
  });
});
