import { createTableColumn } from '../../atoms/Table';
import { Grid } from '../../organisms/Grid';
import { NavigationLink } from '../../context';
import { Button } from '../../atoms/Button';

export interface AdminOrganisationUserProvisionListItemViewModel {
  id: string;
  provisionedDisplayName?: string;
  provisionedRole: string;
  provisionedUserName: string;
  provisioningMethod: string;
  status: string;
}

export interface AdminOrganisationUserProvisionsPageProps {
  error?: string;
  loading?: boolean;
  onCreateProvision?: () => void;
  onImportUsers?: () => void;
  onManageInvitations?: () => void;
  onPageChange: (page: number) => void;
  getProvisionHref?: (
    provision: AdminOrganisationUserProvisionListItemViewModel,
  ) => string;
  organisationName: string;
  page: number;
  pageSize: number;
  provisions: readonly AdminOrganisationUserProvisionListItemViewModel[];
  totalRecords: number;
}

function readable(value: string) {
  return value.replaceAll('_', ' ');
}

const column =
  createTableColumn<AdminOrganisationUserProvisionListItemViewModel>();

const columns = [
  column.accessor('provisionedDisplayName', {
    className: 'first:pl-3',
    header: 'Provisioned user',
    cell: ({ row, value }) => (
      <div className="min-w-48">
        <p className="font-semibold text-foreground">
          {value ?? row.provisionedUserName}
        </p>
        {value ? (
          <p className="text-xs text-muted-foreground">
            {row.provisionedUserName}
          </p>
        ) : null}
      </div>
    ),
  }),
  column.accessor('provisionedRole', {
    header: 'Role',
    cell: ({ value }) => <span className="capitalize">{readable(value)}</span>,
  }),
  column.accessor('provisioningMethod', {
    header: 'Method',
    cell: ({ value }) => <span className="uppercase">{value}</span>,
  }),
  column.accessor('status', {
    header: 'Status',
    cell: ({ value }) => <span className="capitalize">{readable(value)}</span>,
  }),
];

export function AdminOrganisationUserProvisionsPage({
  error,
  getProvisionHref,
  loading,
  onCreateProvision,
  onImportUsers,
  onManageInvitations,
  onPageChange,
  organisationName,
  page,
  pageSize,
  provisions,
  totalRecords,
}: AdminOrganisationUserProvisionsPageProps) {
  const resolvedColumns = getProvisionHref
    ? [
        ...columns,
        column.display('actions', {
          align: 'right',
          header: <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <NavigationLink
              className="mr-2 inline-flex px-2 py-1 font-semibold text-primary hover:bg-accent/35"
              href={getProvisionHref(row)}
            >
              View
            </NavigationLink>
          ),
        }),
      ]
    : columns;

  return (
    <div className="space-y-4">
      {onCreateProvision || onImportUsers || onManageInvitations ? (
        <div className="flex justify-end gap-2">
          {onManageInvitations ? (
            <Button onClick={onManageInvitations} variant="outline">
              Manage invitations
            </Button>
          ) : null}
          {onImportUsers ? (
            <Button onClick={onImportUsers}>Import CSV</Button>
          ) : null}
          {onCreateProvision ? (
            <Button onClick={onCreateProvision}>Invite user</Button>
          ) : null}
        </div>
      ) : null}
      <Grid
        caption={`Provisioned users in ${organisationName}`}
        columns={resolvedColumns}
        empty="This organisation has no provisioned users."
        error={error}
        getRowId={(provision) => provision.id}
        highlight
        loading={loading}
        pagination={{ page, pageSize, totalRecords, onPageChange }}
        rows={provisions}
        title="Provisioned users"
      />
    </div>
  );
}
