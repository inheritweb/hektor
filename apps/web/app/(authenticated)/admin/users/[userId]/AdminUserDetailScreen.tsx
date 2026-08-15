'use client';

import { useAdminGetUser } from '@hektor/query/users';
import { AdminUserDetailPage } from '@hektor/ui/pages';

export interface AdminUserDetailScreenProps {
  userId: string;
}

export function AdminUserDetailScreen({ userId }: AdminUserDetailScreenProps) {
  const user = useAdminGetUser({ params: { userId } });

  if (user.isPending) {
    return (
      <div aria-label="Loading user" className="space-y-4">
        <div className="h-8 w-32 animate-pulse bg-accent" />
        <div className="h-28 animate-pulse bg-accent/70" />
        <div className="h-48 animate-pulse bg-accent/50" />
      </div>
    );
  }

  if (user.isError) {
    return (
      <section>
        <h1 className="text-2xl font-bold">We couldn&apos;t load this user.</h1>
        <p className="mt-2 text-muted-foreground">{user.error.message}</p>
      </section>
    );
  }

  return <AdminUserDetailPage backHref="/admin/users" user={user.data.data} />;
}
