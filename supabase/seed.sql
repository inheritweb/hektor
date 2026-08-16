begin;

insert into public.organisations (id, name, slug, status)
values
  ('10000000-0000-4000-8000-000000000001', 'Northbridge University', 'northbridge-university', 'active'),
  ('10000000-0000-4000-8000-000000000002', 'Westmere College', 'westmere-college', 'active'),
  ('10000000-0000-4000-8000-000000000003', 'Ashdown Institute', 'ashdown-institute', 'suspended')
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  status = excluded.status;

insert into public.cohorts (
  id,
  organisation_id,
  name,
  starts_on,
  ends_on,
  status
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'September 2026',
    '2026-09-01',
    '2029-08-31',
    'active'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'September 2025',
    '2025-09-01',
    '2028-08-31',
    'active'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000002',
    'January 2027',
    '2027-01-04',
    '2030-01-03',
    'active'
  )
on conflict (id) do update
set
  name = excluded.name,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  status = excluded.status;

insert into public.organisation_contract_periods (
  id,
  organisation_id,
  starts_on,
  ends_on,
  learner_seat_allowance
)
values
  (
    '50000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '2026-09-01',
    '2027-08-31',
    250
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    '2026-09-01',
    '2027-08-31',
    80
  )
on conflict (id) do update
set
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  learner_seat_allowance = excluded.learner_seat_allowance;

insert into public.organisation_users (
  id,
  organisation_id,
  cohort_id,
  external_id,
  user_name,
  display_name,
  given_name,
  family_name,
  role,
  scim_status
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    null,
    'northbridge-admin-1',
    'maya.patel@northbridge.example',
    'Maya Patel',
    'Maya',
    'Patel',
    'org_admin',
    'active'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'northbridge-learner-1',
    'sam.rivera@northbridge.example',
    'Sam Rivera',
    'Sam',
    'Rivera',
    'learner',
    'active'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000002',
    null,
    'westmere-tutor-1',
    'alex.morgan@westmere.example',
    'Alex Morgan',
    'Alex',
    'Morgan',
    'tutor',
    'active'
  )
on conflict (id) do update
set
  cohort_id = excluded.cohort_id,
  external_id = excluded.external_id,
  user_name = excluded.user_name,
  display_name = excluded.display_name,
  given_name = excluded.given_name,
  family_name = excluded.family_name,
  role = excluded.role,
  scim_status = excluded.scim_status;

insert into public.groups (id, organisation_id, cohort_id, name, status)
values
  (
    '40000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Clinical Practice A',
    'active'
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    null,
    'Teaching Staff',
    'active'
  )
on conflict (id) do update
set
  cohort_id = excluded.cohort_id,
  name = excluded.name,
  status = excluded.status;

insert into public.group_users (
  organisation_id,
  group_id,
  organisation_user_id
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000002'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000003'
  )
on conflict do nothing;

insert into public.organisation_seat_activations (
  organisation_id,
  organisation_contract_period_id,
  organisation_user_id
)
values (
  '10000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002'
)
on conflict do nothing;

commit;
