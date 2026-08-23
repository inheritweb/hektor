create type public.organisation_status as enum ('active', 'suspended', 'archived');
create type public.organisation_role as enum ('org_admin', 'tutor', 'learner');
create type public.organisation_user_status as enum ('active', 'suspended');
create type public.provisioning_method as enum ('scim', 'csv', 'manual');
create type public.provisioning_status as enum ('pending', 'linked', 'inactive', 'revoked', 'failed');
create type public.group_status as enum ('active', 'archived');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = greatest(
    clock_timestamp(),
    old.updated_at + interval '1 millisecond'
  );
  return new;
end;
$$;

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 255),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status public.organisation_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organisation_cohorts (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 255),
  starts_on date not null,
  ends_on date not null,
  status public.group_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on > starts_on),
  unique (id, organisation_id),
  unique (organisation_id, name, starts_on)
);

create table public.organisation_users (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete restrict,
  organisation_cohort_id uuid,
  role public.organisation_role not null,
  status public.organisation_user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organisation_cohort_id, organisation_id)
    references public.organisation_cohorts (id, organisation_id) on delete restrict,
  unique (id, organisation_id),
  unique (organisation_id, user_id)
);

create index organisation_users_user_organisation_idx
on public.organisation_users (user_id, organisation_id);
create index organisation_users_organisation_cohort_id_idx
on public.organisation_users (organisation_cohort_id)
where organisation_cohort_id is not null;

create table public.organisation_user_provisions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  organisation_user_id uuid,
  organisation_cohort_id uuid,
  provisioning_method public.provisioning_method not null,
  source_external_id text,
  provisioned_user_name text not null check (char_length(provisioned_user_name) between 1 and 320),
  provisioned_display_name text,
  provisioned_given_name text,
  provisioned_family_name text,
  provisioned_role public.organisation_role not null,
  status public.provisioning_status not null default 'pending',
  last_synchronized_at timestamptz,
  linked_at timestamptz,
  revoked_at timestamptz,
  invitation_token_hash text check (invitation_token_hash is null or char_length(invitation_token_hash) = 64),
  invitation_sent_at timestamptz,
  invitation_expires_at timestamptz,
  invitation_consumed_at timestamptz,
  invitation_send_count integer not null default 0 check (invitation_send_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organisation_user_id, organisation_id)
    references public.organisation_users (id, organisation_id) on delete restrict,
  foreign key (organisation_cohort_id, organisation_id)
    references public.organisation_cohorts (id, organisation_id) on delete restrict,
  unique (id, organisation_id),
  check ((status = 'linked' and organisation_user_id is not null and linked_at is not null) or status <> 'linked'),
  check ((status = 'revoked' and revoked_at is not null) or status <> 'revoked')
);

create unique index organisation_user_provisions_source_external_id_unique
on public.organisation_user_provisions (organisation_id, provisioning_method, source_external_id)
where source_external_id is not null and status <> 'revoked';
create index organisation_user_provisions_organisation_user_id_idx
on public.organisation_user_provisions (organisation_user_id)
where organisation_user_id is not null;
create unique index organisation_user_provisions_active_membership_unique
on public.organisation_user_provisions (organisation_user_id)
where organisation_user_id is not null and status <> 'revoked';
create index organisation_user_provisions_organisation_cohort_id_idx
on public.organisation_user_provisions (organisation_cohort_id)
where organisation_cohort_id is not null;

create table public.organisation_groups (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  organisation_cohort_id uuid,
  name text not null check (char_length(name) between 1 and 255),
  status public.group_status not null default 'active',
  provisioning_method public.provisioning_method,
  source_external_id text,
  last_synchronized_at timestamptz,
  source_deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organisation_cohort_id, organisation_id)
    references public.organisation_cohorts (id, organisation_id) on delete restrict,
  unique (id, organisation_id),
  unique (organisation_id, name),
  check ((provisioning_method is null and source_external_id is null) or provisioning_method is not null)
);

create unique index organisation_groups_source_external_id_unique
on public.organisation_groups (organisation_id, provisioning_method, source_external_id)
where provisioning_method is not null and source_external_id is not null;

create table public.organisation_group_users (
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  organisation_group_id uuid not null,
  organisation_user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (organisation_group_id, organisation_user_id),
  foreign key (organisation_group_id, organisation_id)
    references public.organisation_groups (id, organisation_id) on delete cascade,
  foreign key (organisation_user_id, organisation_id)
    references public.organisation_users (id, organisation_id) on delete cascade
);

create table public.organisation_provisioned_group_users (
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  organisation_group_id uuid not null,
  organisation_user_provision_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (organisation_group_id, organisation_user_provision_id),
  foreign key (organisation_group_id, organisation_id)
    references public.organisation_groups (id, organisation_id) on delete cascade,
  foreign key (organisation_user_provision_id, organisation_id)
    references public.organisation_user_provisions (id, organisation_id) on delete cascade
);

create table public.organisation_contract_periods (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  starts_on date not null,
  ends_on date not null,
  learner_seat_allowance integer not null check (learner_seat_allowance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on > starts_on),
  unique (id, organisation_id),
  unique (organisation_id, starts_on, ends_on)
);

create table public.organisation_seat_activations (
  organisation_id uuid not null references public.organisations (id) on delete restrict,
  organisation_contract_period_id uuid not null,
  organisation_user_id uuid not null,
  activated_at timestamptz not null default now(),
  released_at timestamptz,
  primary key (organisation_contract_period_id, organisation_user_id),
  foreign key (organisation_contract_period_id, organisation_id)
    references public.organisation_contract_periods (id, organisation_id) on delete restrict,
  foreign key (organisation_user_id, organisation_id)
    references public.organisation_users (id, organisation_id) on delete restrict
);

create function public.transition_organisation_user_provision(
  target_provision_id uuid,
  expected_status public.provisioning_status,
  lifecycle_action text,
  target_organisation_user_id uuid default null
)
returns public.organisation_user_provisions
language plpgsql
security definer
set search_path = ''
as $$
declare
  provision public.organisation_user_provisions;
  membership public.organisation_users;
  contract_period public.organisation_contract_periods;
  active_seats integer;
begin
  select * into provision
  from public.organisation_user_provisions
  where id = target_provision_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'provision_not_found';
  end if;

  if provision.status <> expected_status then
    raise exception using errcode = 'P0001', message = 'provision_status_conflict';
  end if;

  if lifecycle_action = 'link' then
    if provision.status <> 'pending' or target_organisation_user_id is null then
      raise exception using errcode = '22023', message = 'invalid_provision_transition';
    end if;

    select * into membership
    from public.organisation_users
    where id = target_organisation_user_id
      and organisation_id = provision.organisation_id
    for update;

    if not found then
      raise exception using errcode = '22023', message = 'membership_not_found';
    end if;

    if provision.provisioned_role = 'learner' then
      select * into contract_period
      from public.organisation_contract_periods
      where organisation_id = provision.organisation_id
        and current_date >= starts_on
        and current_date < ends_on
      order by starts_on desc
      limit 1
      for update;

      if found then
        select count(*) into active_seats
        from public.organisation_seat_activations
        where organisation_contract_period_id = contract_period.id
          and released_at is null
          and organisation_user_id <> membership.id;

        if active_seats >= contract_period.learner_seat_allowance then
          raise exception using errcode = 'P0001', message = 'learner_seat_capacity_exhausted';
        end if;

        insert into public.organisation_seat_activations (
          organisation_id,
          organisation_contract_period_id,
          organisation_user_id,
          released_at
        ) values (
          provision.organisation_id,
          contract_period.id,
          membership.id,
          null
        )
        on conflict (organisation_contract_period_id, organisation_user_id)
        do update set released_at = null, activated_at = now();
      end if;
    else
      update public.organisation_seat_activations
      set released_at = now()
      where organisation_user_id = membership.id
        and released_at is null;
    end if;

    update public.organisation_users
    set role = provision.provisioned_role,
        organisation_cohort_id = coalesce(
          provision.organisation_cohort_id,
          organisation_cohort_id
        ),
        status = 'active'
    where id = membership.id;

    update public.organisation_user_provisions
    set organisation_user_id = membership.id,
        status = 'linked',
        linked_at = coalesce(linked_at, now()),
        revoked_at = null
    where id = provision.id
    returning * into provision;

    insert into public.organisation_group_users (
      organisation_id,
      organisation_group_id,
      organisation_user_id
    )
    select
      provision.organisation_id,
      provision_group.organisation_group_id,
      membership.id
    from public.organisation_provisioned_group_users provision_group
    where provision_group.organisation_user_provision_id = provision.id
    on conflict (organisation_group_id, organisation_user_id) do nothing;
  elsif lifecycle_action = 'deactivate' then
    if provision.status <> 'linked' or provision.organisation_user_id is null then
      raise exception using errcode = '22023', message = 'invalid_provision_transition';
    end if;

    update public.organisation_users
    set status = 'suspended'
    where id = provision.organisation_user_id;

    update public.organisation_seat_activations
    set released_at = now()
    where organisation_user_id = provision.organisation_user_id
      and released_at is null;

    update public.organisation_user_provisions
    set status = 'inactive'
    where id = provision.id
    returning * into provision;
  elsif lifecycle_action = 'reactivate' then
    if provision.status <> 'inactive' or provision.organisation_user_id is null then
      raise exception using errcode = '22023', message = 'invalid_provision_transition';
    end if;

    return public.transition_organisation_user_provision(
      provision.id,
      provision.status,
      'link_inactive',
      provision.organisation_user_id
    );
  elsif lifecycle_action = 'link_inactive' then
    if provision.status <> 'inactive' or target_organisation_user_id is null then
      raise exception using errcode = '22023', message = 'invalid_provision_transition';
    end if;

    update public.organisation_user_provisions set status = 'pending' where id = provision.id;
    return public.transition_organisation_user_provision(
      provision.id,
      'pending',
      'link',
      target_organisation_user_id
    );
  elsif lifecycle_action = 'revoke' then
    if provision.status = 'revoked' then
      raise exception using errcode = '22023', message = 'invalid_provision_transition';
    end if;

    if provision.organisation_user_id is not null then
      update public.organisation_users set status = 'suspended'
      where id = provision.organisation_user_id;
      update public.organisation_seat_activations set released_at = now()
      where organisation_user_id = provision.organisation_user_id and released_at is null;
    end if;

    update public.organisation_user_provisions
    set status = 'revoked', revoked_at = now()
    where id = provision.id
    returning * into provision;
  elsif lifecycle_action = 'fail' then
    if provision.status <> 'pending' then
      raise exception using errcode = '22023', message = 'invalid_provision_transition';
    end if;
    update public.organisation_user_provisions set status = 'failed'
    where id = provision.id returning * into provision;
  elsif lifecycle_action = 'retry' then
    if provision.status <> 'failed' then
      raise exception using errcode = '22023', message = 'invalid_provision_transition';
    end if;
    update public.organisation_user_provisions set status = 'pending'
    where id = provision.id returning * into provision;
  else
    raise exception using errcode = '22023', message = 'unknown_provision_lifecycle_action';
  end if;

  return provision;
end;
$$;

create function public.issue_organisation_provision_invitation(
  target_organisation_id uuid,
  target_provision_id uuid,
  target_token_hash text,
  target_expires_at timestamptz,
  resend_cooldown_seconds integer
)
returns public.organisation_user_provisions
language plpgsql
security definer
set search_path = ''
as $$
declare
  provision public.organisation_user_provisions;
begin
  select * into provision
  from public.organisation_user_provisions
  where id = target_provision_id and organisation_id = target_organisation_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'provision_not_found';
  end if;
  if provision.status <> 'pending' then
    raise exception using errcode = 'P0001', message = 'provision_not_pending';
  end if;
  if not exists (
    select 1 from public.organisations
    where id = provision.organisation_id and status = 'active'
  ) then
    raise exception using errcode = 'P0001', message = 'organisation_not_active';
  end if;
  if provision.invitation_sent_at is not null
    and provision.invitation_sent_at > now() - make_interval(secs => resend_cooldown_seconds)
  then
    raise exception using errcode = 'P0001', message = 'invitation_cooldown';
  end if;

  update public.organisation_user_provisions
  set invitation_token_hash = target_token_hash,
      invitation_sent_at = now(),
      invitation_expires_at = target_expires_at,
      invitation_consumed_at = null,
      invitation_send_count = invitation_send_count + 1
  where id = provision.id
  returning * into provision;

  return provision;
end;
$$;

create function public.update_organisation(
  target_organisation_id uuid,
  expected_status public.organisation_status,
  target_name text,
  target_slug text,
  target_status public.organisation_status
)
returns public.organisations
language plpgsql
security definer
set search_path = ''
as $$
declare
  organisation public.organisations;
begin
  select * into organisation
  from public.organisations
  where id = target_organisation_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'organisation_not_found';
  end if;
  if organisation.status <> expected_status then
    raise exception using errcode = 'P0001', message = 'organisation_status_conflict';
  end if;
  update public.organisations
  set name = target_name,
      slug = target_slug,
      status = target_status
  where id = organisation.id
  returning * into organisation;

  return organisation;
end;
$$;

create function public.create_organisation_contract_period(
  target_organisation_id uuid,
  target_starts_on date,
  target_ends_on date,
  target_learner_seat_allowance integer
)
returns public.organisation_contract_periods
language plpgsql
security definer
set search_path = ''
as $$
declare
  contract_period public.organisation_contract_periods;
begin
  perform 1 from public.organisations
  where id = target_organisation_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'organisation_not_found';
  end if;
  if target_ends_on <= target_starts_on then
    raise exception using errcode = '22023', message = 'invalid_contract_period_dates';
  end if;
  if target_learner_seat_allowance < 0 then
    raise exception using errcode = '22023', message = 'invalid_learner_seat_allowance';
  end if;
  if exists (
    select 1 from public.organisation_contract_periods
    where organisation_id = target_organisation_id
      and daterange(starts_on, ends_on, '[)') &&
          daterange(target_starts_on, target_ends_on, '[)')
  ) then
    raise exception using errcode = 'P0001', message = 'contract_period_overlap';
  end if;

  insert into public.organisation_contract_periods (
    organisation_id, starts_on, ends_on, learner_seat_allowance
  ) values (
    target_organisation_id, target_starts_on, target_ends_on,
    target_learner_seat_allowance
  ) returning * into contract_period;

  return contract_period;
end;
$$;

create function public.update_organisation_contract_period(
  target_organisation_id uuid,
  target_contract_period_id uuid,
  expected_updated_at timestamptz,
  target_starts_on date,
  target_ends_on date,
  target_learner_seat_allowance integer
)
returns public.organisation_contract_periods
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_seats bigint;
  contract_period public.organisation_contract_periods;
begin
  perform 1 from public.organisations
  where id = target_organisation_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'organisation_not_found';
  end if;

  select * into contract_period
  from public.organisation_contract_periods
  where id = target_contract_period_id
    and organisation_id = target_organisation_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'contract_period_not_found';
  end if;
  if date_trunc('milliseconds', contract_period.updated_at) <>
      date_trunc('milliseconds', expected_updated_at) then
    raise exception using errcode = 'P0001', message = 'contract_period_conflict';
  end if;
  if target_ends_on <= target_starts_on then
    raise exception using errcode = '22023', message = 'invalid_contract_period_dates';
  end if;
  if exists (
    select 1 from public.organisation_contract_periods
    where organisation_id = target_organisation_id
      and id <> target_contract_period_id
      and daterange(starts_on, ends_on, '[)') &&
          daterange(target_starts_on, target_ends_on, '[)')
  ) then
    raise exception using errcode = 'P0001', message = 'contract_period_overlap';
  end if;

  select count(*) into active_seats
  from public.organisation_seat_activations
  where organisation_contract_period_id = target_contract_period_id
    and released_at is null;

  if target_learner_seat_allowance < active_seats then
    raise exception using errcode = 'P0001', message = 'learner_seat_allowance_below_usage';
  end if;

  update public.organisation_contract_periods
  set starts_on = target_starts_on,
      ends_on = target_ends_on,
      learner_seat_allowance = target_learner_seat_allowance
  where id = contract_period.id
  returning * into contract_period;

  return contract_period;
end;
$$;

create function public.consume_organisation_provision_invitation(
  target_provision_id uuid,
  expected_token_hash text
)
returns public.organisation_user_provisions
language plpgsql
security definer
set search_path = ''
as $$
declare
  provision public.organisation_user_provisions;
begin
  select * into provision
  from public.organisation_user_provisions
  where id = target_provision_id
  for update;

  if not found
    or provision.status <> 'pending'
    or provision.invitation_token_hash is distinct from expected_token_hash
    or provision.invitation_expires_at is null
    or provision.invitation_expires_at <= now()
    or provision.invitation_consumed_at is not null
    or not exists (
      select 1 from public.organisations
      where id = provision.organisation_id and status = 'active'
    )
  then
    raise exception using errcode = 'P0002', message = 'invitation_not_found';
  end if;

  update public.organisation_user_provisions
  set invitation_token_hash = null,
      invitation_consumed_at = now()
  where id = provision.id
  returning * into provision;

  return provision;
end;
$$;

create function public.clear_organisation_provision_invitation(
  target_provision_id uuid,
  expected_token_hash text
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.organisation_user_provisions
  set invitation_token_hash = null,
      invitation_sent_at = null,
      invitation_expires_at = null,
      invitation_consumed_at = null,
      invitation_send_count = greatest(invitation_send_count - 1, 0)
  where id = target_provision_id and invitation_token_hash = expected_token_hash;
$$;

create function public.accept_organisation_user_provision(
  target_provision_id uuid,
  expected_status public.provisioning_status,
  target_user_id uuid
)
returns public.organisation_user_provisions
language plpgsql
security definer
set search_path = ''
as $$
declare
  provision public.organisation_user_provisions;
  membership public.organisation_users;
begin
  select * into provision
  from public.organisation_user_provisions
  where id = target_provision_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'provision_not_found';
  end if;
  if provision.status <> expected_status or provision.status <> 'pending' then
    raise exception using errcode = 'P0001', message = 'provision_status_conflict';
  end if;
  if not exists (
    select 1 from public.organisations
    where id = provision.organisation_id and status = 'active'
  ) then
    raise exception using errcode = 'P0001', message = 'organisation_not_active';
  end if;

  select * into membership
  from public.organisation_users
  where organisation_id = provision.organisation_id
    and user_id = target_user_id
  for update;

  if not found then
    insert into public.organisation_users (
      organisation_id,
      user_id,
      organisation_cohort_id,
      role,
      status
    ) values (
      provision.organisation_id,
      target_user_id,
      provision.organisation_cohort_id,
      provision.provisioned_role,
      'suspended'
    ) returning * into membership;
  end if;

  return public.transition_organisation_user_provision(
    provision.id,
    provision.status,
    'link',
    membership.id
  );
end;
$$;

revoke all on function public.transition_organisation_user_provision(
  uuid,
  public.provisioning_status,
  text,
  uuid
) from public;
grant execute on function public.transition_organisation_user_provision(
  uuid,
  public.provisioning_status,
  text,
  uuid
) to service_role;
revoke all on function public.accept_organisation_user_provision(
  uuid,
  public.provisioning_status,
  uuid
) from public;
grant execute on function public.accept_organisation_user_provision(
  uuid,
  public.provisioning_status,
  uuid
) to service_role;
revoke all on function public.issue_organisation_provision_invitation(
  uuid, uuid, text, timestamptz, integer
) from public;
grant execute on function public.issue_organisation_provision_invitation(
  uuid, uuid, text, timestamptz, integer
) to service_role;
revoke all on function public.consume_organisation_provision_invitation(uuid, text) from public;
grant execute on function public.consume_organisation_provision_invitation(uuid, text) to service_role;
revoke all on function public.clear_organisation_provision_invitation(uuid, text) from public;
grant execute on function public.clear_organisation_provision_invitation(uuid, text) to service_role;
revoke all on function public.update_organisation(
  uuid, public.organisation_status, text, text, public.organisation_status
) from public;
grant execute on function public.update_organisation(
  uuid, public.organisation_status, text, text, public.organisation_status
) to service_role;

create function public.is_platform_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create function public.has_organisation_role(
  target_organisation_id uuid,
  allowed_roles public.organisation_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organisation_users
    join public.organisations on organisations.id = organisation_users.organisation_id
    where organisation_users.organisation_id = target_organisation_id
      and organisation_users.user_id = (select auth.uid())
      and organisation_users.role = any(allowed_roles)
      and organisation_users.status = 'active'
      and organisations.status = 'active'
  );
$$;

revoke all on function public.has_organisation_role(uuid, public.organisation_role[]) from public;
grant execute on function public.has_organisation_role(uuid, public.organisation_role[]) to authenticated;

alter table public.organisations enable row level security;
alter table public.organisation_cohorts enable row level security;
alter table public.organisation_users enable row level security;
alter table public.organisation_user_provisions enable row level security;
alter table public.organisation_groups enable row level security;
alter table public.organisation_group_users enable row level security;
alter table public.organisation_provisioned_group_users enable row level security;
alter table public.organisation_contract_periods enable row level security;
alter table public.organisation_seat_activations enable row level security;

grant select, insert, update, delete on table public.organisations to authenticated;
grant select, insert, update, delete on table public.organisation_cohorts to authenticated;
grant select, insert, update, delete on table public.organisation_users to authenticated;
grant select, insert, update, delete on table public.organisation_user_provisions to authenticated;
grant select, insert, update, delete on table public.organisation_groups to authenticated;
grant select, insert, update, delete on table public.organisation_group_users to authenticated;
grant select, insert, update, delete on table public.organisation_provisioned_group_users to authenticated;
grant select, insert, update, delete on table public.organisation_contract_periods to authenticated;
grant select, insert, update, delete on table public.organisation_seat_activations to authenticated;

grant all on table public.organisations to service_role;
grant all on table public.organisation_cohorts to service_role;
grant all on table public.organisation_users to service_role;
grant all on table public.organisation_user_provisions to service_role;
grant all on table public.organisation_groups to service_role;
grant all on table public.organisation_group_users to service_role;
grant all on table public.organisation_provisioned_group_users to service_role;
grant all on table public.organisation_contract_periods to service_role;
grant all on table public.organisation_seat_activations to service_role;

create policy "Platform admins manage organisations"
on public.organisations for all to authenticated
using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
create policy "Organisation users read their organisation"
on public.organisations for select to authenticated
using ((select public.has_organisation_role(id, array['org_admin', 'tutor', 'learner']::public.organisation_role[])));
create policy "Platform admins manage organisation users"
on public.organisation_users for all to authenticated
using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
create policy "Organisation users read themselves"
on public.organisation_users for select to authenticated using (user_id = (select auth.uid()));
create policy "Organisation admins read organisation users"
on public.organisation_users for select to authenticated
using ((select public.has_organisation_role(organisation_id, array['org_admin']::public.organisation_role[])));
create policy "Platform admins manage organisation user provisions"
on public.organisation_user_provisions for all to authenticated
using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
create policy "Organisation admins read organisation user provisions"
on public.organisation_user_provisions for select to authenticated
using ((select public.has_organisation_role(organisation_id, array['org_admin']::public.organisation_role[])));
create policy "Platform admins manage organisation cohorts"
on public.organisation_cohorts for all to authenticated using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
create policy "Platform admins manage organisation groups"
on public.organisation_groups for all to authenticated using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
create policy "Platform admins manage organisation group users"
on public.organisation_group_users for all to authenticated using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
create policy "Platform admins manage provisioned organisation group users"
on public.organisation_provisioned_group_users for all to authenticated using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
create policy "Platform admins manage contract periods"
on public.organisation_contract_periods for all to authenticated using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
create policy "Platform admins manage seat activations"
on public.organisation_seat_activations for all to authenticated using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));

create trigger organisations_set_updated_at before update on public.organisations
for each row execute function public.set_updated_at();
create trigger organisation_cohorts_set_updated_at before update on public.organisation_cohorts
for each row execute function public.set_updated_at();
create trigger organisation_users_set_updated_at before update on public.organisation_users
for each row execute function public.set_updated_at();
create trigger organisation_user_provisions_set_updated_at before update on public.organisation_user_provisions
for each row execute function public.set_updated_at();
create trigger organisation_groups_set_updated_at before update on public.organisation_groups
for each row execute function public.set_updated_at();
create trigger organisation_contract_periods_set_updated_at before update on public.organisation_contract_periods
for each row execute function public.set_updated_at();
