create type public.patient_scenario_scope as enum ('system', 'user', 'organisation');
create type public.patient_scenario_status as enum ('draft', 'published', 'archived');
create type public.patient_scenario_step_kind as enum ('beginning', 'progression');

create table public.patient_scenarios (
  id uuid primary key default gen_random_uuid(),
  scope public.patient_scenario_scope not null,
  organisation_id uuid references public.organisations (id) on delete restrict,
  user_id uuid references auth.users (id) on delete restrict,
  slug text not null check (
    char_length(slug) between 1 and 100 and
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  status public.patient_scenario_status not null default 'draft',
  patient_profile_id uuid not null references public.patient_profiles (id) on delete restrict,
  patient_profile_version_id uuid not null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text not null check (char_length(trim(description)) between 1 and 1000),
  care_setting text not null check (care_setting in (
    'acute_inpatient',
    'community',
    'community_mental_health',
    'home',
    'maternity',
    'paediatric_community',
    'postnatal',
    'primary_care'
  )),
  intended_clinical_audiences text[] not null default '{}' check (
    intended_clinical_audiences <@ array[
      'nursing',
      'pharmacy',
      'medicine',
      'allied_health'
    ]::text[] and
    cardinality(intended_clinical_audiences) <= 20
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (id, patient_profile_id),
  foreign key (patient_profile_version_id, patient_profile_id)
    references public.patient_profile_versions (id, patient_profile_id)
    on delete restrict,
  check (
    (scope = 'system' and organisation_id is null and user_id is null) or
    (scope = 'user' and organisation_id is null and user_id is not null) or
    (scope = 'organisation' and organisation_id is not null and user_id is null)
  ),
  check ((status = 'archived') = (archived_at is not null))
);

create unique index patient_scenarios_system_slug_unique
on public.patient_scenarios (slug)
where scope = 'system';

create unique index patient_scenarios_user_slug_unique
on public.patient_scenarios (user_id, slug)
where scope = 'user';

create unique index patient_scenarios_organisation_slug_unique
on public.patient_scenarios (organisation_id, slug)
where scope = 'organisation';

create index patient_scenarios_patient_profile_version_idx
on public.patient_scenarios (patient_profile_id, patient_profile_version_id);

create table public.patient_profile_layers (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.patient_profiles (id) on delete restrict,
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text check (
    description is null or char_length(trim(description)) between 1 and 1000
  ),
  schema_version integer not null check (schema_version = 1),
  operations jsonb not null check (
    jsonb_typeof(operations) = 'array' and
    jsonb_array_length(operations) between 1 and 500
  ),
  source_reference text check (
    source_reference is null or char_length(trim(source_reference)) between 1 and 500
  ),
  source_revision text check (
    source_revision is null or char_length(trim(source_revision)) between 1 and 200
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, patient_profile_id),
  check ((source_reference is null) = (source_revision is null))
);

create index patient_profile_layers_patient_profile_idx
on public.patient_profile_layers (patient_profile_id, created_at);

create table public.patient_scenario_steps (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null,
  patient_profile_id uuid not null,
  position integer not null check (position between 1 and 100000),
  kind public.patient_scenario_step_kind not null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text check (
    description is null or char_length(trim(description)) between 1 and 1000
  ),
  patient_profile_layer_id uuid not null,
  ehr_changes jsonb not null default '[]'::jsonb check (
    jsonb_typeof(ehr_changes) = 'array' and
    jsonb_array_length(ehr_changes) <= 100
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scenario_id, position),
  foreign key (scenario_id, patient_profile_id)
    references public.patient_scenarios (id, patient_profile_id)
    on delete restrict,
  foreign key (patient_profile_layer_id, patient_profile_id)
    references public.patient_profile_layers (id, patient_profile_id)
    on delete restrict,
  check (
    (kind = 'beginning' and position = 10) or
    (kind = 'progression' and position > 10)
  )
);

create unique index patient_scenario_steps_beginning_unique
on public.patient_scenario_steps (scenario_id)
where kind = 'beginning';

create index patient_scenario_steps_scenario_position_idx
on public.patient_scenario_steps (scenario_id, position);

alter table public.patient_scenarios enable row level security;
alter table public.patient_profile_layers enable row level security;
alter table public.patient_scenario_steps enable row level security;

grant select on table public.patient_scenarios to authenticated;
grant select on table public.patient_profile_layers to authenticated;
grant select on table public.patient_scenario_steps to authenticated;
grant all on table public.patient_scenarios to service_role;
grant all on table public.patient_profile_layers to service_role;
grant all on table public.patient_scenario_steps to service_role;

create policy "Platform admins read patient scenarios"
on public.patient_scenarios for select to authenticated
using ((select public.is_platform_admin()));

create policy "Platform admins read patient profile layers"
on public.patient_profile_layers for select to authenticated
using ((select public.is_platform_admin()));

create policy "Platform admins read patient scenario steps"
on public.patient_scenario_steps for select to authenticated
using ((select public.is_platform_admin()));

create trigger patient_scenarios_set_updated_at
before update on public.patient_scenarios
for each row execute function public.set_updated_at();

create trigger patient_profile_layers_set_updated_at
before update on public.patient_profile_layers
for each row execute function public.set_updated_at();

create trigger patient_scenario_steps_set_updated_at
before update on public.patient_scenario_steps
for each row execute function public.set_updated_at();
