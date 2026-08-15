import type { Meta, StoryObj } from '@storybook/react-vite';

import { createTableColumn, Table, type TableProps } from './Table.component';

interface ExampleRow {
  active: boolean;
  email: string;
  id: string;
  name: string;
}

const rows: ExampleRow[] = [
  { id: '1', name: 'Alex Morgan', email: 'alex@example.com', active: true },
  { id: '2', name: 'Sam Rivera', email: 'sam@example.com', active: false },
];

const column = createTableColumn<ExampleRow>();

const columns = [
  column.accessor('name', { header: 'Name' }),
  column.accessor('email', { header: 'Email' }),
  column.accessor('active', {
    header: 'Status',
    cell: ({ value }) => (value ? 'Active' : 'Inactive'),
  }),
  column.display('actions', {
    align: 'right',
    header: 'Actions',
    cell: ({ row }) => <button type="button">View {row.name}</button>,
  }),
];

function ExampleTable(props: TableProps<ExampleRow>) {
  return <Table {...props} />;
}

const meta = {
  title: 'Atoms/Table',
  component: ExampleTable,
} satisfies Meta<TableProps<ExampleRow>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    caption: 'Example people',
    columns,
    getRowId: (row: ExampleRow) => row.id,
    highlight: true,
    rows,
    striped: true,
  },
};
