import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createTableColumn } from '../../atoms/Table';

import { Grid } from './Grid.component';

interface Row {
  id: string;
  name: string;
}

const column = createTableColumn<Row>();

const columns = [column.accessor('name', { header: 'Name' })];

describe('Grid', () => {
  it('drives controlled pagination', async () => {
    const onPageChange = vi.fn();
    render(
      <Grid
        columns={columns}
        getRowId={(row) => row.id}
        pagination={{ page: 2, pageSize: 20, totalRecords: 45, onPageChange }}
        rows={[{ id: '1', name: 'Alex' }]}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('announces loading, error and empty states', () => {
    const view = render(
      <Grid columns={columns} getRowId={(row) => row.id} loading rows={[]} />,
    );
    expect(screen.getByLabelText('Loading data')).toBeTruthy();

    view.rerender(
      <Grid
        columns={columns}
        error="Unavailable"
        getRowId={(row) => row.id}
        rows={[]}
      />,
    );
    expect(screen.getByRole('alert').textContent).toContain('Unavailable');

    view.rerender(
      <Grid
        columns={columns}
        empty="Nobody yet"
        getRowId={(row) => row.id}
        rows={[]}
      />,
    );
    expect(screen.getByText('Nobody yet')).toBeTruthy();
  });
});
