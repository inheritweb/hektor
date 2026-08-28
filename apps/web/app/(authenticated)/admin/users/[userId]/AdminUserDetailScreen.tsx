'use client';

import { useState } from 'react';
import { useAdminGetUser, useAdminUpdateUser } from '@hektor/query/users';
import { AdminUserDetailPage } from '@hektor/ui/pages';
import {
  UserLifecycleEditSheet,
  type UserLifecycleEditValues,
} from '@hektor/ui/organisms';

export interface AdminUserDetailScreenProps {
  userId: string;
}

export function AdminUserDetailScreen({ userId }: AdminUserDetailScreenProps) {
  const [editing, setEditing] = useState(false);
  const user = useAdminGetUser({ params: { userId } });
  const updateUser = useAdminUpdateUser({ onSuccess: () => setEditing(false) });

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

  const data = user.data.data;

  return (
    <>
      <AdminUserDetailPage
        backHref="/admin/users"
        onEdit={() => setEditing(true)}
        user={data}
      />
      <UserLifecycleEditSheet
        error={updateUser.error?.message}
        initialValues={{
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          platformRole: data.platformRole,
          status: data.status,
        }}
        onOpenChange={setEditing}
        onSave={(values: UserLifecycleEditValues) =>
          updateUser.mutate({
            params: { userId },
            body: { ...values, expectedUpdatedAt: data.updatedAt },
          })
        }
        open={editing}
        pending={updateUser.isPending}
      />
    </>
  );
}
