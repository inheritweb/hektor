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
  new.updated_at = now();
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
  primary key (organisation_contract_period_id, organisation_user_id),
  foreign key (organisation_contract_period_id, organisation_id)
    references public.organisation_contract_periods (id, organisation_id) on delete restrict,
  foreign key (organisation_user_id, organisation_id)
    references public.organisation_users (id, organisation_id) on delete restrict
);

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
