import type { ReactNode } from 'react';

import { Button } from '../../atoms/Button';
import { Table, type TableProps } from '../../atoms/Table';
import { cn } from '../../lib/utils';

export interface GridPagination {
  onPageChange: (page: number) => void;
  page: number;
  pageSize: number;
  totalRecords: number;
}

export interface GridProps<Row> extends TableProps<Row> {
  actions?: ReactNode;
  empty?: ReactNode;
  error?: ReactNode;
  filters?: ReactNode;
  loading?: boolean;
  pagination?: GridPagination;
  title?: ReactNode;
}

function GridLoader({ columns }: { columns: number }) {
  return (
    <div aria-label="Loading data" aria-live="polite" className="space-y-2">
      {Array.from({ length: 4 }, (_, row) => (
        <div className="flex gap-2" key={row}>
          {Array.from({ length: columns }, (_, column) => (
            <span
              aria-hidden="true"
              className="h-10 flex-1 animate-pulse bg-accent"
              key={column}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Grid<Row>({
  actions,
  className,
  columns,
  empty = 'No records found.',
  error,
  filters,
  getRowId,
  loading = false,
  pagination,
  rows,
  title,
  ...tableProps
}: GridProps<Row>) {
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.totalRecords / pagination.pageSize))
    : 1;

  return (
    <section className={cn('space-y-5', className)}>
      {title || actions ? (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {title ? (
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          ) : null}
          {actions ? (
            <div className="flex flex-wrap gap-2">{actions}</div>
          ) : null}
        </header>
      ) : null}

      {filters ? <div className="flex flex-wrap gap-3">{filters}</div> : null}

      {loading ? (
        <GridLoader columns={Math.max(columns.length, 1)} />
      ) : error ? (
        <div
          aria-live="polite"
          className="border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          {empty}
        </div>
      ) : (
        <Table
          {...tableProps}
          columns={columns}
          getRowId={getRowId}
          rows={rows}
        />
      )}

      {pagination && !loading && !error && pagination.totalRecords > 0 ? (
        <nav
          aria-label="Pagination"
          className="flex flex-col gap-3 pt-1 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-muted-foreground">
            Page {pagination.page} of {totalPages} · {pagination.totalRecords}{' '}
            records
          </p>
          <div className="flex gap-2">
            <Button
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              size="sm"
              variant="outline"
            >
              Previous
            </Button>
            <Button
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              size="sm"
              variant="outline"
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}
    </section>
  );
}
