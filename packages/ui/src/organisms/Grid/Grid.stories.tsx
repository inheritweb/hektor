import type { Meta, StoryObj } from '@storybook/react-vite';
import { createTableColumn } from '../../atoms/Table';

import { Grid, type GridProps } from './Grid.component';

interface ExampleRow {
  email: string;
  id: string;
  name: string;
}

const column = createTableColumn<ExampleRow>();

const columns = [
  column.accessor('name', { header: 'Name' }),
  column.accessor('email', { header: 'Email' }),
];

const rows: ExampleRow[] = [
  { id: '1', name: 'Alex Morgan', email: 'alex@example.com' },
  { id: '2', name: 'Sam Rivera', email: 'sam@example.com' },
];

const meta = {
  title: 'Organisms/Grid',
  component: Grid,
  args: {
    caption: 'Example people',
    columns,
    getRowId: (row: ExampleRow) => row.id,
    rows,
    title: 'People',
  },
} satisfies Meta<GridProps<ExampleRow>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    pagination: {
      page: 1,
      pageSize: 20,
      totalRecords: 42,
      onPageChange: () => undefined,
    },
  },
};

export const Loading: Story = { args: { loading: true } };

export const Empty: Story = { args: { rows: [] } };

export const Error: Story = {
  args: { error: 'The records could not be loaded.' },
};
