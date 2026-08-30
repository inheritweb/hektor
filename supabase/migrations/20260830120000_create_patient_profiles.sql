create type public.patient_profile_scope as enum ('system', 'user', 'organisation');
create type public.patient_profile_status as enum ('active', 'archived');
create type public.patient_profile_version_state as enum (
  'draft',
  'in_review',
  'published',
  'superseded',
  'withdrawn'
);

create table public.patient_profiles (
  id uuid primary key default gen_random_uuid(),
  scope public.patient_profile_scope not null,
  organisation_id uuid references public.organisations (id) on delete restrict,
  user_id uuid references auth.users (id) on delete restrict,
  slug text not null check (
    char_length(slug) between 1 and 100 and
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  status public.patient_profile_status not null default 'active',
  source_profile_id uuid references public.patient_profiles (id) on delete restrict,
  source_version_id uuid,
  created_by uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (id, scope),
  check (
    (scope = 'system' and organisation_id is null and user_id is null) or
    (scope = 'user' and organisation_id is null and user_id is not null) or
    (scope = 'organisation' and organisation_id is not null and user_id is null)
  ),
  check ((status = 'archived') = (archived_at is not null)),
  check ((source_profile_id is null) = (source_version_id is null)),
  check (source_profile_id is null or source_profile_id <> id)
);

create unique index patient_profiles_system_slug_unique
on public.patient_profiles (slug)
where scope = 'system';

create unique index patient_profiles_user_slug_unique
on public.patient_profiles (user_id, slug)
where scope = 'user';

create unique index patient_profiles_organisation_slug_unique
on public.patient_profiles (organisation_id, slug)
where scope = 'organisation';

create index patient_profiles_source_profile_id_idx
on public.patient_profiles (source_profile_id)
where source_profile_id is not null;

create table public.patient_profile_versions (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete restrict,
  version_number integer not null check (version_number > 0),
  state public.patient_profile_version_state not null default 'draft',
  schema_version integer not null check (schema_version = 1),
  document jsonb not null check (
    jsonb_typeof(document) = 'object' and
    document ->> 'schemaVersion' = '1' and
    document ->> 'synthetic' = 'true'
  ),
  content_hash text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  change_summary text not null check (char_length(trim(change_summary)) between 1 and 1000),
  authored_by uuid references auth.users (id) on delete restrict,
  source_reference text check (
    source_reference is null or char_length(trim(source_reference)) between 1 and 1000
  ),
  source_revision text check (
    source_revision is null or char_length(trim(source_revision)) between 1 and 255
  ),
  reviewed_by uuid references auth.users (id) on delete restrict,
  published_by uuid references auth.users (id) on delete restrict,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  published_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, patient_profile_id),
  unique (patient_profile_id, version_number),
  check (authored_by is not null or source_reference is not null),
  check ((source_reference is null) = (source_revision is null)),
  check (
    (state = 'draft' and submitted_at is null and reviewed_at is null and published_at is null and withdrawn_at is null) or
    (state = 'in_review' and submitted_at is not null and reviewed_at is null and published_at is null and withdrawn_at is null) or
    (state = 'published' and submitted_at is not null and reviewed_at is not null and published_at is not null and withdrawn_at is null) or
    (state = 'superseded' and submitted_at is not null and reviewed_at is not null and published_at is not null and withdrawn_at is null) or
    (state = 'withdrawn' and submitted_at is not null and reviewed_at is not null and published_at is not null and withdrawn_at is not null)
  )
);

create unique index patient_profile_versions_working_unique
on public.patient_profile_versions (patient_profile_id)
where state in ('draft', 'in_review');

create unique index patient_profile_versions_published_unique
on public.patient_profile_versions (patient_profile_id)
where state = 'published';

create index patient_profile_versions_profile_state_idx
on public.patient_profile_versions (patient_profile_id, state, version_number desc);

alter table public.patient_profiles
add constraint patient_profiles_source_version_lineage_fkey
foreign key (source_version_id, source_profile_id)
references public.patient_profile_versions (id, patient_profile_id)
on delete restrict;

create function public.prevent_patient_profile_version_content_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.state <> 'draft' and (
    new.patient_profile_id is distinct from old.patient_profile_id or
    new.version_number is distinct from old.version_number or
    new.schema_version is distinct from old.schema_version or
    new.document is distinct from old.document or
    new.content_hash is distinct from old.content_hash or
    new.change_summary is distinct from old.change_summary or
    new.authored_by is distinct from old.authored_by or
    new.source_reference is distinct from old.source_reference or
    new.source_revision is distinct from old.source_revision
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'patient_profile_version_content_immutable';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_patient_profile_version_content_changes() from public;

alter table public.patient_profiles enable row level security;
alter table public.patient_profile_versions enable row level security;

grant select on table public.patient_profiles to authenticated;
grant select on table public.patient_profile_versions to authenticated;
grant all on table public.patient_profiles to service_role;
grant all on table public.patient_profile_versions to service_role;

create policy "Platform admins read patient profiles"
on public.patient_profiles for select to authenticated
using ((select public.is_platform_admin()));

create policy "Platform admins read patient profile versions"
on public.patient_profile_versions for select to authenticated
using ((select public.is_platform_admin()));

create trigger patient_profiles_set_updated_at
before update on public.patient_profiles
for each row execute function public.set_updated_at();

create trigger patient_profile_versions_set_updated_at
before update on public.patient_profile_versions
for each row execute function public.set_updated_at();

create trigger patient_profile_versions_prevent_content_changes
before update on public.patient_profile_versions
for each row execute function public.prevent_patient_profile_version_content_changes();
