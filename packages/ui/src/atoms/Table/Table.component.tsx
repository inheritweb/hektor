import type { Key, ReactNode } from 'react';

import { cn } from '#lib/utils';

type StringKeyOf<Row> = Extract<keyof Row, string>;

export interface TableCellContext<Row, Value> {
  row: Row;
  value: Value;
}

export interface TableAccessorColumn<Row, Key extends StringKeyOf<Row>> {
  accessor: Key;
  align?: 'left' | 'center' | 'right';
  cell?: (context: TableCellContext<Row, Row[Key]>) => ReactNode;
  className?: string;
  header?: ReactNode;
  id?: string;
}

export interface TableDisplayColumn<Row> {
  align?: 'left' | 'center' | 'right';
  cell: (context: { row: Row }) => ReactNode;
  className?: string;
  header?: ReactNode;
  id: string;
}

export type TableColumn<Row> =
  | {
      [Key in StringKeyOf<Row>]: TableAccessorColumn<Row, Key>;
    }[StringKeyOf<Row>]
  | TableDisplayColumn<Row>;

export interface TableProps<Row> {
  caption?: ReactNode;
  className?: string;
  columns: readonly TableColumn<Row>[];
  getRowId: (row: Row) => Key;
  highlight?: boolean;
  rows: readonly Row[];
  striped?: boolean;
}

export function createTableColumn<Row>() {
  return {
    accessor<Key extends StringKeyOf<Row>>(
      accessor: Key,
      column: Omit<TableAccessorColumn<Row, Key>, 'accessor'> = {},
    ): TableAccessorColumn<Row, Key> {
      return { accessor, ...column };
    },
    display(
      id: string,
      column: Omit<TableDisplayColumn<Row>, 'id'>,
    ): TableDisplayColumn<Row> {
      return { id, ...column };
    },
  };
}

function defaultCell(value: unknown): ReactNode {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (value instanceof Date) return value.toLocaleDateString();
  return null;
}

function columnId<Row>(column: TableColumn<Row>) {
  return 'accessor' in column ? (column.id ?? column.accessor) : column.id;
}

function renderCell<Row>(column: TableColumn<Row>, row: Row) {
  if (!('accessor' in column)) return column.cell({ row });

  const value = row[column.accessor];
  return column.cell
    ? column.cell({ row, value } as never)
    : defaultCell(value);
}

export function Table<Row>({
  caption,
  className,
  columns,
  getRowId,
  highlight = false,
  rows,
  striped = false,
}: TableProps<Row>) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                className={cn(
                  'whitespace-nowrap px-4 py-3 font-semibold text-foreground first:pl-0 last:pr-0',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.className,
                )}
                key={columnId(column)}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              className={cn(
                'border-b border-border',
                striped && index % 2 === 1 && 'bg-accent/40',
                highlight && 'transition-colors hover:bg-accent/20',
              )}
              key={getRowId(row)}
            >
              {columns.map((column) => (
                <td
                  className={cn(
                    'px-4 py-3 align-middle first:pl-0 last:pr-0',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className,
                  )}
                  key={columnId(column)}
                >
                  {renderCell(column, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
