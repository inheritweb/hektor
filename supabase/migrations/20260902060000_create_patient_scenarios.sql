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
    jsonb_array_length(operations) <= 500
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

create function public.create_system_patient_scenario_draft(
  p_patient_profile_id uuid,
  p_patient_profile_version_id uuid,
  p_slug text,
  p_title text,
  p_description text,
  p_care_setting text,
  p_intended_clinical_audiences text[],
  p_beginning_step_title text,
  p_beginning_step_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scenario_id uuid := gen_random_uuid();
  v_layer_id uuid := gen_random_uuid();
begin
  if not exists (
    select 1
    from public.patient_profiles profile
    join public.patient_profile_versions version
      on version.patient_profile_id = profile.id
    where profile.id = p_patient_profile_id
      and profile.status = 'active'
      and version.id = p_patient_profile_version_id
  ) then
    raise exception using
      errcode = 'P0002',
      message = 'Patient profile version not found';
  end if;

  insert into public.patient_scenarios (
    id,
    scope,
    slug,
    status,
    patient_profile_id,
    patient_profile_version_id,
    title,
    description,
    care_setting,
    intended_clinical_audiences
  ) values (
    v_scenario_id,
    'system',
    p_slug,
    'draft',
    p_patient_profile_id,
    p_patient_profile_version_id,
    p_title,
    p_description,
    p_care_setting,
    p_intended_clinical_audiences
  );

  insert into public.patient_profile_layers (
    id,
    patient_profile_id,
    title,
    description,
    schema_version,
    operations
  ) values (
    v_layer_id,
    p_patient_profile_id,
    p_beginning_step_title,
    p_beginning_step_description,
    1,
    '[]'::jsonb
  );

  insert into public.patient_scenario_steps (
    scenario_id,
    patient_profile_id,
    position,
    kind,
    title,
    description,
    patient_profile_layer_id,
    ehr_changes
  ) values (
    v_scenario_id,
    p_patient_profile_id,
    10,
    'beginning',
    p_beginning_step_title,
    p_beginning_step_description,
    v_layer_id,
    '[]'::jsonb
  );

  return v_scenario_id;
end;
$$;

revoke all on function public.create_system_patient_scenario_draft(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text[],
  text,
  text
) from public, anon, authenticated;

grant execute on function public.create_system_patient_scenario_draft(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text[],
  text,
  text
) to service_role;

create function public.update_system_patient_scenario_draft(
  p_scenario_id uuid,
  p_expected_updated_at timestamptz,
  p_slug text,
  p_title text,
  p_description text,
  p_care_setting text,
  p_intended_clinical_audiences text[],
  p_beginning_step_title text,
  p_beginning_step_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scenario public.patient_scenarios%rowtype;
  v_beginning_step public.patient_scenario_steps%rowtype;
begin
  select * into v_scenario
  from public.patient_scenarios
  where id = p_scenario_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Patient scenario not found';
  end if;

  if v_scenario.scope <> 'system' or v_scenario.status <> 'draft' then
    raise exception using
      errcode = 'P0001',
      message = 'Only system-owned draft scenarios can be edited';
  end if;

  if date_trunc('milliseconds', v_scenario.updated_at) <>
     p_expected_updated_at then
    raise exception using
      errcode = 'P0001',
      message = 'Patient scenario has changed since it was loaded';
  end if;

  select * into strict v_beginning_step
  from public.patient_scenario_steps
  where scenario_id = p_scenario_id
    and kind = 'beginning';

  update public.patient_scenarios
  set slug = p_slug,
      title = p_title,
      description = p_description,
      care_setting = p_care_setting,
      intended_clinical_audiences = p_intended_clinical_audiences
  where id = p_scenario_id;

  update public.patient_scenario_steps
  set title = p_beginning_step_title,
      description = p_beginning_step_description
  where id = v_beginning_step.id;

  update public.patient_profile_layers
  set title = p_beginning_step_title,
      description = p_beginning_step_description
  where id = v_beginning_step.patient_profile_layer_id
    and jsonb_array_length(operations) = 0;

  return p_scenario_id;
exception
  when no_data_found then
    raise exception using
      errcode = 'P0001',
      message = 'Patient scenario does not have exactly one beginning step';
  when too_many_rows then
    raise exception using
      errcode = 'P0001',
      message = 'Patient scenario does not have exactly one beginning step';
end;
$$;

revoke all on function public.update_system_patient_scenario_draft(
  uuid,
  timestamptz,
  text,
  text,
  text,
  text,
  text[],
  text,
  text
) from public, anon, authenticated;

grant execute on function public.update_system_patient_scenario_draft(
  uuid,
  timestamptz,
  text,
  text,
  text,
  text,
  text[],
  text,
  text
) to service_role;
