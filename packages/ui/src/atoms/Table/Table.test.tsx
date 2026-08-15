import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createTableColumn, Table } from './Table.component';

interface Row {
  active: boolean;
  id: string;
  name: string;
}

const column = createTableColumn<Row>();

const columns = [
  column.accessor('name', { header: 'Name' }),
  column.accessor('active', { header: 'Active' }),
  column.display('detail', {
    header: 'Detail',
    cell: ({ row }) => `Open ${row.id}`,
  }),
];

describe('Table', () => {
  it('renders accessor and display columns', () => {
    render(
      <Table
        caption="People"
        columns={columns}
        getRowId={(row) => row.id}
        rows={[{ id: 'user-1', name: 'Alex', active: true }]}
      />,
    );

    expect(screen.getByText('Alex')).toBeTruthy();
    expect(screen.getByText('Yes')).toBeTruthy();
    expect(screen.getByText('Open user-1')).toBeTruthy();
    expect(screen.getByText('People').className).toContain('sr-only');
  });
});
