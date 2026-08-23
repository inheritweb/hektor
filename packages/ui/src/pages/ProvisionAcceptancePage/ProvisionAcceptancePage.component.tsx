import { Button } from '../../atoms';
import { UnauthenticatedTemplate } from '../../templates';

export interface ProvisionAcceptancePageProps {
  error?: string;
  isAccepting?: boolean;
  organisationName: string;
  onAccept: () => void;
  onDecline: () => void;
  provisionedDisplayName?: string;
  provisionedRole: string;
  provisionedUserName: string;
}

function readable(value: string) {
  return value.replaceAll('_', ' ');
}

export function ProvisionAcceptancePage({
  error,
  isAccepting = false,
  organisationName,
  onAccept,
  onDecline,
  provisionedDisplayName,
  provisionedRole,
  provisionedUserName,
}: ProvisionAcceptancePageProps) {
  return (
    <UnauthenticatedTemplate width="lg">
      <p className="text-sm font-semibold text-primary">
        Organisation invitation
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Join {organisationName} on Hektor?
      </h1>
      <p className="mt-4 leading-7 text-muted-foreground">
        You are about to accept an invitation to join {organisationName} on
        Hektor. Are you sure you wish to proceed?
      </p>

      <dl className="mt-8 grid gap-5 bg-accent/25 p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Institutional identity</dt>
          <dd className="mt-1 font-semibold">
            {provisionedDisplayName ?? provisionedUserName}
          </dd>
          <dd className="mt-1 text-muted-foreground">{provisionedUserName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Role</dt>
          <dd className="mt-1 font-semibold capitalize">
            {readable(provisionedRole)}
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button disabled={isAccepting} onClick={onAccept}>
          {isAccepting ? 'Joining…' : `Join ${organisationName}`}
        </Button>
        <Button disabled={isAccepting} onClick={onDecline} variant="outline">
          Not now
        </Button>
      </div>
      {error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </UnauthenticatedTemplate>
  );
}
