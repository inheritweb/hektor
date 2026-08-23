import { UnauthenticatedTemplate } from '../../templates';

export function InvitationUnavailablePage() {
  return (
    <UnauthenticatedTemplate>
      <p className="text-sm font-semibold text-primary">
        Organisation invitation
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        This invitation is no longer available.
      </h1>
      <p className="mt-4 leading-7 text-muted-foreground">
        It may have expired, already been used, or been replaced by a newer
        invitation. Please ask your organisation administrator to send another
        one.
      </p>
    </UnauthenticatedTemplate>
  );
}
