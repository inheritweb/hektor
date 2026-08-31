begin;

insert into public.organisations (id, name, slug, status)
values
  ('b3539fdd-e1aa-45a0-86ac-093b15212273', 'Northbridge University', 'northbridge-university', 'active'),
  ('f29e6891-351a-4445-b2dc-f30cadcf0416', 'Westmere College', 'westmere-college', 'active'),
  ('fc7225ca-ce67-412b-835f-5ec547b95aa5', 'Ashdown Institute', 'ashdown-institute', 'suspended');

-- Local-only credential used by the separate simulator as a real SCIM client.
-- Plaintext: hektor_scim_simulator_local_only_2026
insert into public.organisation_scim_configurations (
  organisation_id, token_hash, token_suffix, default_role, token_created_at
)
values (
  'b3539fdd-e1aa-45a0-86ac-093b15212273',
  '9ad27c65f2bdd654ed2ecf5064129eb91bcb44f807ca0dbfded1c2401055d7b9',
  '2026',
  'learner',
  now()
);

insert into public.organisation_cohorts (
  id, organisation_id, name, starts_on, ends_on, status
)
values
  ('289eb836-9965-4f32-8ea2-238077d18de9', 'b3539fdd-e1aa-45a0-86ac-093b15212273', 'September 2026', '2026-09-01', '2029-08-31', 'active'),
  ('187b8849-3f31-4e6c-8823-4833bd7a71fc', 'b3539fdd-e1aa-45a0-86ac-093b15212273', 'September 2025', '2025-09-01', '2028-08-31', 'active'),
  ('15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'f29e6891-351a-4445-b2dc-f30cadcf0416', 'January 2027', '2027-01-04', '2030-01-03', 'active'),
  ('793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', 'September 2026', '2026-09-01', '2029-08-31', 'active');

insert into public.organisation_contract_periods (
  id, organisation_id, starts_on, ends_on, learner_seat_allowance
)
values
  ('8f3b6408-8e28-4810-8d8b-0ffa55661e29', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '2026-09-01', '2027-08-31', 250),
  ('ee4fa24c-3ed2-4a6f-b03c-b1ec4463d11b', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '2026-09-01', '2027-08-31', 80),
  ('54edb91a-4689-4f13-88e4-fb56cf1b5d89', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '2026-09-01', '2027-08-31', 150);

insert into public.organisation_groups (
  id,
  organisation_id,
  organisation_cohort_id,
  name,
  status,
  provisioning_method,
  source_external_id,
  last_synchronized_at
)
values
  ('8508007f-6858-4386-921d-55aaf3f3c1ed', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '289eb836-9965-4f32-8ea2-238077d18de9', 'Clinical Practice A', 'active', 'scim', 'northbridge-clinical-a', now()),
  ('5a76736e-8ef2-4a87-88c4-cbe91b7cc1f7', 'b3539fdd-e1aa-45a0-86ac-093b15212273', null, 'Teaching Staff', 'active', null, null, null),
  ('b364abad-4db9-4da6-a47e-7d286e931c29', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'January Study Group', 'active', 'csv', 'westmere-january-study', now()),
  ('952e10fc-fa69-40ab-a601-78089128ad21', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'Community Placement', 'active', 'scim', 'ashdown-community-placement', now());

with seed_users (
  id,
  display_name,
  email,
  organisation_id,
  organisation_cohort_id,
  organisation_role,
  provisioning_method,
  platform_admin
) as (
  values
  ('e8fe755c-5ff2-4c7e-8e0d-5d1691f5d0d3'::uuid, 'Jordan Ellis', 'admin@hektor.local', null::uuid, null::uuid, null::public.organisation_role, null::public.provisioning_method, true),
  ('630f6d91-8930-4a6a-a59f-9b9afaa89bc4', 'Priya Shah', 'priya.shah@example.test', null, null, null, null, false),
  ('e8cfae07-e6e3-4062-b62b-c0b3e4e019a6', 'Marcus Green', 'marcus.green@example.test', null, null, null, null, false),
  ('7ebb481d-de29-4826-998b-682a688fed11', 'Eleanor Brooks', 'eleanor.brooks@example.test', null, null, null, null, false),
  ('1a72a6ec-5b70-436c-ba9d-d318cd5e2617', 'Tomás Silva', 'tomas.silva@example.test', null, null, null, null, false),
  ('370ec940-70cd-43d4-8bdc-8d933e5250e5', 'Isla Phillips', 'isla.phillips@northbridge.example', null, null, null, null, false),

  ('a058bcd6-bab1-4558-a115-4b347a305154', 'Maya Patel', 'maya.patel@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', null, 'org_admin', 'scim', false),
  ('b8f5c104-1d91-4a9a-bd6d-1401c0745b41', 'Daniel Okafor', 'daniel.okafor@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', null, 'org_admin', 'scim', false),
  ('8dec1a0f-80fc-42ab-92c4-4fda976ae494', 'Alice Morgan', 'alice.morgan@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', null, 'tutor', 'scim', false),
  ('f5e319f4-0e77-47c3-a4bb-d3a9b7f52ea9', 'Nina Foster', 'nina.foster@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', null, 'tutor', null, false),
  ('f1f827e6-bf7e-474e-b813-8dde039987ad', 'Owen Davies', 'owen.davies@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', null, 'tutor', 'scim', false),
  ('e5dd9b1c-6508-4a5b-bfea-929bdf74af11', 'Fatima Hassan', 'fatima.hassan@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', null, 'tutor', 'scim', false),
  ('eb36d08e-d541-4fe1-adff-394dba9e2e69', 'George Bennett', 'george.bennett@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', null, 'tutor', 'scim', false),
  ('298f8c18-50a5-4474-ad49-900834d68311', 'Sam Rivera', 'sam.rivera@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '289eb836-9965-4f32-8ea2-238077d18de9', 'learner', 'scim', false),
  ('0e547783-0559-4f9f-a78c-4c88e91233d4', 'Aisha Khan', 'aisha.khan@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '289eb836-9965-4f32-8ea2-238077d18de9', 'learner', 'scim', false),
  ('b511969c-7c69-4086-bb54-230eb95098ad', 'Ben Carter', 'ben.carter@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '289eb836-9965-4f32-8ea2-238077d18de9', 'learner', 'scim', false),
  ('7eeb52a6-0312-49ba-ac15-f383f2d8247b', 'Chloe Martin', 'chloe.martin@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '289eb836-9965-4f32-8ea2-238077d18de9', 'learner', 'scim', false),
  ('c43ebdd4-287e-45a0-bf74-1ab21c5f0f87', 'Dev Singh', 'dev.singh@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '289eb836-9965-4f32-8ea2-238077d18de9', 'learner', 'scim', false),
  ('79d6d107-f7bd-4329-bb11-685ae5cfbb91', 'Erin Walsh', 'erin.walsh@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '289eb836-9965-4f32-8ea2-238077d18de9', 'learner', 'scim', false),
  ('7a3a0f38-859d-4d71-a221-8313545426c6', 'Farah Ali', 'farah.ali@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '187b8849-3f31-4e6c-8823-4833bd7a71fc', 'learner', 'scim', false),
  ('4e459860-e2a1-4e87-adc6-7f95d205efce', 'Hugo Price', 'hugo.price@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '187b8849-3f31-4e6c-8823-4833bd7a71fc', 'learner', 'scim', false),
  ('6dbacd96-1bf5-454a-b7d3-f25a4c95e584', 'Imani Cole', 'imani.cole@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '187b8849-3f31-4e6c-8823-4833bd7a71fc', 'learner', 'scim', false),
  ('cabb6abd-4664-413b-8ab1-cba668beb84f', 'Jack Murphy', 'jack.murphy@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '187b8849-3f31-4e6c-8823-4833bd7a71fc', 'learner', 'scim', false),
  ('56299456-1f5d-4e0d-a325-9946830be37e', 'Keira Young', 'keira.young@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '187b8849-3f31-4e6c-8823-4833bd7a71fc', 'learner', 'scim', false),

  ('9ba1c17d-beb7-463f-a092-2baf09ddd479', 'Helen Ward', 'helen.ward@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', null, 'org_admin', 'csv', false),
  ('03ac389e-17e6-4b98-8cde-8f9d57de8e5a', 'Alex Morgan', 'alex.morgan@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', null, 'tutor', 'csv', false),
  ('b6cdf644-0477-4b79-8c47-94fa409f5d1a', 'Bethany Clarke', 'bethany.clarke@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', null, 'tutor', 'csv', false),
  ('03e2fc30-26b3-4a52-8bc9-ff68372bc63c', 'Colin Hughes', 'colin.hughes@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', null, 'tutor', 'csv', false),
  ('11e2c9f6-4b98-4dfa-92b3-9bf2829d8a41', 'Daisy Adams', 'daisy.adams@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv', false),
  ('394a0d86-2be8-4249-95de-b44c20c61997', 'Ethan Foster', 'ethan.foster@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv', false),
  ('481f702e-06d3-4daa-8c77-51d74ac8666d', 'Freya Cooper', 'freya.cooper@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv', false),
  ('e46f9ba0-b8f3-494d-88e9-1ecd8722dc25', 'Gabriel Scott', 'gabriel.scott@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv', false),
  ('0db61d9f-404c-4bfe-919f-cf38656e5b53', 'Hannah Bell', 'hannah.bell@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv', false),
  ('a9a7620a-428f-43a7-af99-ed3317489e62', 'Isaac Turner', 'isaac.turner@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv', false),
  ('442d5f59-5807-434e-a2d0-b37a857aba72', 'Jasmine Wood', 'jasmine.wood@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv', false),
  ('5cef4ab2-7d3a-4877-a6cd-131e822b2826', 'Kian Evans', 'kian.evans@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv', false),
  ('3628f4d7-cbae-46d8-9157-2a775145f2c4', 'Lily Baker', 'lily.baker@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv', false),

  ('f38d4738-1ac3-46ad-ba1a-207c6b94650a', 'Nadia Rahman', 'nadia.rahman@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', null, 'org_admin', 'scim', false),
  ('47da87b0-6e14-4c73-93b7-0adb5edfabd4', 'Peter Lawson', 'peter.lawson@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', null, 'org_admin', 'scim', false),
  ('27fcbc1c-a1fe-4458-b147-6bbf7034c5fa', 'Rachel Kim', 'rachel.kim@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', null, 'tutor', 'scim', false),
  ('df502a53-6a68-42ae-bd19-e46ae5089f49', 'Steven Brown', 'steven.brown@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', null, 'tutor', 'scim', false),
  ('b30876b1-553e-4f3e-afb8-eb31dec468b4', 'Tara Wilson', 'tara.wilson@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', null, 'tutor', 'scim', false),
  ('0af530c9-6354-46fe-9c4c-20996df5c829', 'Uma Desai', 'uma.desai@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim', false),
  ('b4bbfdac-8008-4d6c-b513-0181ec2adcec', 'Victor Moore', 'victor.moore@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim', false),
  ('ed67dff6-119a-4866-8849-a44b08c73ba3', 'Willow James', 'willow.james@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim', false),
  ('a1f5c2de-5b51-4dcf-8f70-a853b076f4fe', 'Xavier Grant', 'xavier.grant@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim', false),
  ('3c736ac8-4393-488d-bee6-2b3fa6d5a3b2', 'Yasmin Ahmed', 'yasmin.ahmed@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim', false),
  ('e14f8f52-a6dc-4faf-b05a-39f1809c019f', 'Zachary Hall', 'zachary.hall@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim', false),
  ('a801f42d-a865-44f8-96f0-4cb7be1c4e8e', 'Amelia King', 'amelia.king@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim', false),
  ('6e5c383d-db2c-45c9-aa64-0c8457a0abe4', 'Bilal Hussain', 'bilal.hussain@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim', false),
  ('42d35285-8897-4a70-8ebd-f4728939e551', 'Cerys Jones', 'cerys.jones@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim', false),
  ('ad350e28-7867-4ebd-a8aa-e06c5405d262', 'Dominic Lee', 'dominic.lee@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim', false),
  ('155bab4c-b3a7-4119-b3ff-e20b1016f3e1', 'Esme Hill', 'esme.hill@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim', false),
  ('3c337632-28f9-4d88-a1db-38bd841d6f33', 'Finn Lewis', 'finn.lewis@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim', false)
),
inserted_users as (

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  reauthentication_token,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at
)
select
  '00000000-0000-0000-0000-000000000000',
  id,
  'authenticated',
  'authenticated',
  email,
  '',
  now() - interval '30 days',
  '',
  '',
  '',
  '',
  '',
  '',
  jsonb_build_object(
    'provider', 'email',
    'providers', jsonb_build_array('email'),
    'role', case when platform_admin then 'admin' else null end
  ) - case when platform_admin then '__unused__' else 'role' end,
  jsonb_build_object(
    'first_name', split_part(display_name, ' ', 1),
    'last_name', substring(display_name from position(' ' in display_name) + 1)
  ),
  now() - interval '30 days',
  now() - interval '1 day',
  now() - interval '1 day'
from seed_users
returning id
),
inserted_identities as (

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  id::text,
  id,
  jsonb_build_object(
    'sub', id::text,
    'email', email,
    'email_verified', true
  ),
  'email',
  now() - interval '1 day',
  now() - interval '30 days',
  now() - interval '1 day'
from seed_users
join inserted_users using (id)
returning user_id
),
inserted_memberships as (

insert into public.organisation_users (
  id,
  organisation_id,
  user_id,
  organisation_cohort_id,
  role,
  status
)
select
  gen_random_uuid(),
  organisation_id,
  id,
  organisation_cohort_id,
  organisation_role,
  'active'
from seed_users
join inserted_users using (id)
where organisation_id is not null
returning id, organisation_id, user_id
)

insert into public.organisation_user_provisions (
  id,
  organisation_id,
  organisation_user_id,
  organisation_cohort_id,
  provisioning_method,
  source_external_id,
  provisioned_user_name,
  provisioned_display_name,
  provisioned_given_name,
  provisioned_family_name,
  provisioned_role,
  status,
  last_synchronized_at,
  linked_at
)
select
  gen_random_uuid(),
  seed_users.organisation_id,
  inserted_memberships.id,
  seed_users.organisation_cohort_id,
  seed_users.provisioning_method,
  concat('seed-', seed_users.id),
  seed_users.email,
  seed_users.display_name,
  split_part(seed_users.display_name, ' ', 1),
  substring(seed_users.display_name from position(' ' in seed_users.display_name) + 1),
  seed_users.organisation_role,
  'linked',
  now() - interval '1 day',
  now() - interval '1 day'
from seed_users
join inserted_memberships
  on inserted_memberships.organisation_id = seed_users.organisation_id
  and inserted_memberships.user_id = seed_users.id
where seed_users.organisation_id is not null
  and seed_users.provisioning_method is not null;

with seed_pending_provisions (
  display_name,
  email,
  organisation_id,
  organisation_cohort_id,
  organisation_role,
  provisioning_method
) as (
  values
  ('Grace Roberts', 'grace.roberts@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273'::uuid, null::uuid, 'tutor'::public.organisation_role, 'scim'::public.provisioning_method),
  ('Harvey Reid', 'harvey.reid@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '289eb836-9965-4f32-8ea2-238077d18de9', 'learner', 'scim'),
  ('Isla Phillips', 'isla.phillips@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '289eb836-9965-4f32-8ea2-238077d18de9', 'learner', 'scim'),
  ('Jonah Mitchell', 'jonah.mitchell@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '289eb836-9965-4f32-8ea2-238077d18de9', 'learner', 'scim'),
  ('Khadija Perry', 'khadija.perry@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '187b8849-3f31-4e6c-8823-4833bd7a71fc', 'learner', 'scim'),
  ('Leo Russell', 'leo.russell@northbridge.example', 'b3539fdd-e1aa-45a0-86ac-093b15212273', '187b8849-3f31-4e6c-8823-4833bd7a71fc', 'learner', 'scim'),

  ('Megan Price', 'megan.price@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv'),
  ('Noah Cook', 'noah.cook@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv'),
  ('Olivia Rogers', 'olivia.rogers@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv'),
  ('Patrick Reed', 'patrick.reed@westmere.example', 'f29e6891-351a-4445-b2dc-f30cadcf0416', '15a92e6b-c2c6-4fa0-922d-7e1c8fc85cc5', 'learner', 'csv'),

  ('Qasim Shah', 'qasim.shah@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', null, 'tutor', 'scim'),
  ('Ruby Cox', 'ruby.cox@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim'),
  ('Sebastian Gray', 'sebastian.gray@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim'),
  ('Thea Edwards', 'thea.edwards@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim'),
  ('Yusuf Walker', 'yusuf.walker@ashdown.example', 'fc7225ca-ce67-412b-835f-5ec547b95aa5', '793ee194-4f5e-44dd-9f6d-e568b5fe2220', 'learner', 'scim')
)

insert into public.organisation_user_provisions (
  id,
  organisation_id,
  organisation_cohort_id,
  provisioning_method,
  source_external_id,
  provisioned_user_name,
  provisioned_display_name,
  provisioned_given_name,
  provisioned_family_name,
  provisioned_role,
  status,
  last_synchronized_at
)
select
  gen_random_uuid(),
  organisation_id,
  organisation_cohort_id,
  provisioning_method,
  concat('seed-pending-', md5(email)),
  email,
  display_name,
  split_part(display_name, ' ', 1),
  substring(display_name from position(' ' in display_name) + 1),
  organisation_role,
  'pending',
  now()
from seed_pending_provisions;

insert into public.organisation_group_users (
  organisation_id,
  organisation_group_id,
  organisation_user_id
)
select
  organisation_users.organisation_id,
  case organisations.slug
    when 'northbridge-university' then '8508007f-6858-4386-921d-55aaf3f3c1ed'::uuid
    when 'westmere-college' then 'b364abad-4db9-4da6-a47e-7d286e931c29'::uuid
    else '952e10fc-fa69-40ab-a601-78089128ad21'::uuid
  end,
  organisation_users.id
from public.organisation_users
join public.organisations on organisations.id = organisation_users.organisation_id
where organisation_users.role = 'learner';

insert into public.organisation_group_users (
  organisation_id,
  organisation_group_id,
  organisation_user_id
)
select
  organisation_users.organisation_id,
  '5a76736e-8ef2-4a87-88c4-cbe91b7cc1f7',
  organisation_users.id
from public.organisation_users
where organisation_users.organisation_id = 'b3539fdd-e1aa-45a0-86ac-093b15212273'
  and organisation_users.role = 'tutor';

insert into public.organisation_provisioned_group_users (
  organisation_id,
  organisation_group_id,
  organisation_user_provision_id
)
select
  provisions.organisation_id,
  case organisations.slug
    when 'northbridge-university' then '8508007f-6858-4386-921d-55aaf3f3c1ed'::uuid
    when 'westmere-college' then 'b364abad-4db9-4da6-a47e-7d286e931c29'::uuid
    else '952e10fc-fa69-40ab-a601-78089128ad21'::uuid
  end,
  provisions.id
from public.organisation_user_provisions provisions
join public.organisations on organisations.id = provisions.organisation_id
where provisions.status = 'pending'
  and provisions.provisioned_role = 'learner';

insert into public.organisation_seat_activations (
  organisation_id,
  organisation_contract_period_id,
  organisation_user_id,
  activated_at
)
select
  organisation_users.organisation_id,
  case organisations.slug
    when 'northbridge-university' then '8f3b6408-8e28-4810-8d8b-0ffa55661e29'::uuid
    when 'westmere-college' then 'ee4fa24c-3ed2-4a6f-b03c-b1ec4463d11b'::uuid
    else '54edb91a-4689-4f13-88e4-fb56cf1b5d89'::uuid
  end,
  organisation_users.id,
  now() - interval '1 day'
from public.organisation_users
join public.organisations on organisations.id = organisation_users.organisation_id
where organisation_users.role = 'learner';

insert into public.organisation_users (
  id, organisation_id, user_id, organisation_cohort_id, role, status
)
values (
  '2c68004c-eaf4-4516-ae7b-8e4fddbc4ee4',
  'f29e6891-351a-4445-b2dc-f30cadcf0416',
  'b8f5c104-1d91-4a9a-bd6d-1401c0745b41',
  null,
  'org_admin',
  'active'
);

-- Development-only fixture for patient-profile version-history UX. This is
-- intentionally kept out of seeds/production.sql.
insert into public.patient_profiles (
  id, scope, slug, status, created_at, updated_at
) values (
  '1c4292c5-729f-4a48-a403-4c6849be3b04',
  'system',
  'james-bond',
  'active',
  '2026-06-01T09:00:00Z',
  '2026-08-01T09:00:00Z'
) on conflict (slug) where scope = 'system' do nothing;

with base_document as (
  select $james_bond_profile$
  {
    "schemaVersion": 1,
    "synthetic": true,
    "identity": {
      "givenNames": ["James"],
      "familyName": "Bond",
      "dateOfBirth": "1940-11-11",
      "pronouns": { "status": "known", "value": ["he", "him"] },
      "sexAtBirth": { "status": "known", "value": "male" }
    },
    "identifiers": [{
      "id": "hektor-patient-number",
      "kind": "local_patient_number",
      "value": "SIM-HKT-007",
      "display": "Hektor patient number",
      "issuer": "Hektor",
      "synthetic": true
    }],
    "demographics": {
      "ethnicity": { "status": "known", "value": { "display": "White British" } },
      "faithOrBelief": { "status": "unknown" },
      "nationality": { "status": "known", "value": { "display": "British" } }
    },
    "communication": {
      "languages": [{
        "id": "english",
        "language": { "display": "English" },
        "proficiency": "native",
        "interpreterRequired": { "status": "known", "value": false }
      }],
      "preferredLanguageId": "english",
      "preferences": [{
        "id": "concise-direct-communication",
        "summary": "Prefers concise, direct communication."
      }],
      "accessibilityNeeds": []
    },
    "contact": {
      "address": {
        "lines": ["7 Universal Exports Building", "Regent Street"],
        "city": "London",
        "postalCode": "W1B 5RA",
        "country": "United Kingdom",
        "synthetic": true
      }
    },
    "relationships": [],
    "background": [{
      "id": "government-service",
      "category": "occupation",
      "summary": "Employed in government service under a diplomatic and commercial cover role.",
      "details": "Former Royal Navy officer whose work has involved frequent international travel.",
      "sensitivity": "restricted"
    }],
    "problems": [],
    "allergies": [],
    "baselineMedications": [],
    "history": { "entries": [] },
    "catalogue": {
      "synopsis": "A composed, widely travelled former naval officer in government service.",
      "lifeStage": "older_adult",
      "careSettings": ["primary_care"],
      "specialties": ["interprofessional"],
      "tags": []
    }
  }
  $james_bond_profile$::jsonb as document
), version_two as (
  select jsonb_set(
    jsonb_set(
      document,
      '{communication,languages}',
      '[
        {
          "id": "english",
          "language": { "display": "English" },
          "proficiency": "native",
          "interpreterRequired": { "status": "known", "value": false }
        },
        {
          "id": "french",
          "language": { "display": "French" },
          "proficiency": "fluent",
          "interpreterRequired": { "status": "known", "value": false }
        },
        {
          "id": "italian",
          "language": { "display": "Italian" },
          "proficiency": "conversational",
          "interpreterRequired": { "status": "known", "value": false }
        }
      ]'::jsonb
    ),
    '{background}',
    (document -> 'background') || '[
      {
        "id": "active-lifestyle",
        "category": "lifestyle",
        "summary": "Maintains a high level of physical fitness and is an experienced skier, swimmer and horse rider.",
        "sensitivity": "standard"
      },
      {
        "id": "travel-pattern",
        "category": "social",
        "summary": "Work requires frequent overseas travel, often at short notice.",
        "sensitivity": "restricted"
      }
    ]'::jsonb
  ) as document
  from base_document
), version_three as (
  select jsonb_set(
    jsonb_set(
      jsonb_set(
        v2.document,
        '{problems}',
        '[
          {
            "id": "right-shoulder-instability",
            "problem": { "display": "Recurrent right shoulder instability" },
            "clinicalStatus": "active",
            "onsetDate": "1973-01-01",
            "details": "Intermittent pain and instability following multiple occupational injuries."
          },
          {
            "id": "left-knee-injury",
            "problem": { "display": "Previous left knee ligament injury" },
            "clinicalStatus": "inactive",
            "onsetDate": "1981-01-01",
            "details": "Managed conservatively; occasional stiffness after prolonged exertion."
          }
        ]'::jsonb
      ),
      '{allergies}',
      '[
        {
          "id": "penicillin",
          "substance": { "display": "Penicillin" },
          "clinicalStatus": "active",
          "verificationStatus": "confirmed",
          "reactions": ["Generalised urticaria"],
          "severity": "moderate",
          "details": "Reaction documented following treatment in 1977."
        }
      ]'::jsonb
    ),
    '{history,entries}',
    '[
      {
        "id": "naval-service-medical",
        "type": "assessment",
        "summary": "Royal Navy discharge medical recorded excellent general health.",
        "assessment": { "display": "Service discharge medical" },
        "outcome": "Fit for unrestricted duties with no long-term condition identified.",
        "occurred": { "start": { "value": "1968", "precision": "year" } },
        "sensitivity": "restricted"
      },
      {
        "id": "right-shoulder-injury",
        "type": "encounter",
        "summary": "Treated for a right shoulder dislocation following an occupational injury.",
        "encounterType": "emergency_attendance",
        "careSetting": "acute_inpatient",
        "outcome": "Closed reduction performed; recurrent instability was noted at later review.",
        "occurred": { "start": { "value": "1973", "precision": "year", "approximate": true } },
        "sensitivity": "restricted"
      },
      {
        "id": "left-knee-injury",
        "type": "investigation",
        "summary": "Assessed after a left knee twisting injury during field work.",
        "kind": "imaging",
        "investigation": { "display": "Left knee radiograph" },
        "status": "final",
        "results": [],
        "conclusion": "No fracture; probable ligament injury managed conservatively.",
        "occurred": { "start": { "value": "1981", "precision": "year", "approximate": true } },
        "sensitivity": "restricted"
      }
    ]'::jsonb
  ) as document
  from (
    select document
    from version_two
  ) as v2
), version_documents as (
  select 1 as version_number, document from base_document
  union all
  select 2, document from version_two
  union all
  select 3, document from version_three
), version_rows as (
  select
    version_number,
    document,
    case version_number
      when 1 then 'Initial development profile imported.'
      when 2 then 'Expanded language, lifestyle and travel background.'
      when 3 then 'Added reviewed injury, allergy and medical-history detail.'
    end as change_summary,
    case version_number when 1 then '2026-06-01T09:00:00Z'::timestamptz
      when 2 then '2026-07-01T09:00:00Z'::timestamptz
      else '2026-08-01T09:00:00Z'::timestamptz end as event_at
  from version_documents
)
insert into public.patient_profile_versions (
  id,
  patient_profile_id,
  version_number,
  state,
  schema_version,
  document,
  content_hash,
  change_summary,
  source_reference,
  source_revision,
  submitted_at,
  reviewed_at,
  published_at,
  created_at,
  updated_at
)
select
  case version_number
    when 1 then '4556da1a-b03f-4632-aa46-ef4a70eaa30d'::uuid
    when 2 then '40b99356-b91a-4814-ba50-754e487fb9a5'::uuid
    else 'f88d4513-5d70-4d27-a93d-8b4ce9df8b2c'::uuid
  end,
  '1c4292c5-729f-4a48-a403-4c6849be3b04'::uuid,
  version_number,
  case version_number when 3 then 'published' else 'superseded' end::public.patient_profile_version_state,
  1,
  document,
  encode(sha256(convert_to(document::text, 'UTF8')), 'hex'),
  change_summary,
  'Hektor development fixture inspired by the Roger Moore-era James Bond',
  'development-v' || version_number,
  event_at,
  event_at,
  event_at,
  event_at,
  event_at
from version_rows
on conflict (patient_profile_id, version_number) do nothing;

commit;
