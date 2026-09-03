import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const profilesDirectory = resolve(
  repositoryRoot,
  'supabase/seeds/patient-profiles',
);
const scenariosDirectory = resolve(
  repositoryRoot,
  'supabase/seeds/patient-scenarios',
);
const outputPath = resolve(repositoryRoot, 'supabase/seeds/production.sql');
const generatedAt = '2026-08-30T00:00:00.000Z';
const sourceReference = 'https://github.com/DNMSW/epr-unified';
const sourceRevision = '03c7f12';

const sqlText = (value) => `'${value.replaceAll("'", "''")}'`;

const identities = {
  'adebayo-omolade': {
    profileId: '45d1b136-8a97-4628-873a-57971e411bad',
    versionId: '24ae934e-6425-4b5c-a4d2-da9cde9590e3',
  },
  'adam-marsden': {
    profileId: '0716cbfe-b94e-47fe-8cdf-a189fd965c6e',
    versionId: '14ed71d9-685a-4996-a60f-f02a5bf0586b',
  },
  'emma-barlow': {
    profileId: '2ebc8fdd-9ab8-4b2e-b314-ae895f58d23d',
    versionId: '25928245-5cc1-463d-a7d6-8a4ad7cfb394',
  },
  'amina-warsame': {
    profileId: '367c5198-6a4f-4a06-8652-502db44062cc',
    versionId: 'a2681834-dd66-4930-bebb-f24d682f742d',
  },
  'esther-jenkins': {
    profileId: '37ea1fbc-d47c-4b75-b918-19af6184bb3b',
    versionId: '016a3ade-5634-4773-9c08-5c7984af3cec',
  },
  'sarah-williams': {
    profileId: '5f049cd0-e8e2-4918-8cfa-fa2da0364895',
    versionId: '4da06bf1-541e-4e1c-911b-8d8225da94c6',
  },
};

const files = readdirSync(profilesDirectory)
  .filter((file) => file.endsWith('.json'))
  .sort();

const statements = files.map((file) => {
  const slug = file.replace(/\.json$/u, '');
  const identity = identities[slug];
  if (!identity) throw new Error(`No deterministic IDs configured for ${slug}`);

  const document = JSON.stringify(
    JSON.parse(readFileSync(resolve(profilesDirectory, file), 'utf8')),
    null,
    2,
  );

  return `insert into public.patient_profiles (
  id, scope, slug, status, created_at, updated_at
) values (
  '${identity.profileId}', 'system', '${slug}', 'active', '${generatedAt}', '${generatedAt}'
) on conflict (slug) where scope = 'system' do nothing;

do $verify_profile_${slug.replaceAll('-', '_')}$
begin
  if not exists (
    select 1 from public.patient_profiles
    where scope = 'system'
      and slug = '${slug}'
      and organisation_id is null
      and user_id is null
  ) then
    raise exception 'production_patient_profile_drift:${slug}';
  end if;
end;
$verify_profile_${slug.replaceAll('-', '_')}$;

with content as (
  select $patient_document_${slug.replaceAll('-', '_')}$
${document}
$patient_document_${slug.replaceAll('-', '_')}$::jsonb as document
), profile as (
  select id
  from public.patient_profiles
  where scope = 'system'
    and slug = '${slug}'
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
  created_at,
  updated_at
)
select
  '${identity.versionId}',
  profile.id,
  1,
  'draft',
  1,
  document,
  encode(sha256(convert_to(document::text, 'UTF8')), 'hex'),
  'Initial clinically informed import from the EPR Unified prototype; review required before publication.',
  '${sourceReference}',
  '${sourceRevision}',
  '${generatedAt}',
  '${generatedAt}'
from content
cross join profile
on conflict (patient_profile_id, version_number) do update
set
  document = excluded.document,
  content_hash = excluded.content_hash,
  change_summary = excluded.change_summary,
  source_reference = excluded.source_reference,
  source_revision = excluded.source_revision,
  updated_at = excluded.updated_at
where patient_profile_versions.state = 'draft'
  and patient_profile_versions.authored_by is null;

do $verify_version_${slug.replaceAll('-', '_')}$
declare
  expected_hash text;
  stored_hash text;
  stored_document_hash text;
begin
  select encode(
    sha256(convert_to($patient_document_${slug.replaceAll('-', '_')}$
${document}
$patient_document_${slug.replaceAll('-', '_')}$::jsonb::text, 'UTF8')),
    'hex'
  ) into expected_hash;

  select
    content_hash,
    encode(sha256(convert_to(document::text, 'UTF8')), 'hex')
  into stored_hash, stored_document_hash
  from public.patient_profile_versions version
  join public.patient_profiles profile
    on profile.id = version.patient_profile_id
  where profile.scope = 'system'
    and profile.slug = '${slug}'
    and version_number = 1
    and version.state = 'draft'
    and version.schema_version = 1;

  if stored_hash is null or
     stored_hash <> expected_hash or
     stored_document_hash <> expected_hash then
    raise exception 'production_patient_profile_version_drift:${slug}';
  end if;
end;
$verify_version_${slug.replaceAll('-', '_')}$;`;
});

const scenarioFiles = readdirSync(scenariosDirectory)
  .filter((file) => file.endsWith('.json'))
  .sort();

const scenarioStatements = scenarioFiles.map((file) => {
  const scenario = JSON.parse(
    readFileSync(resolve(scenariosDirectory, file), 'utf8'),
  );
  const profileIdentity = identities[scenario.patientProfileSlug];
  if (!profileIdentity)
    throw new Error(
      `No patient profile configured for scenario ${scenario.slug}`,
    );
  if (scenario.patientProfileVersionNumber !== 1)
    throw new Error(`Unsupported patient profile version for ${scenario.slug}`);
  if (!Array.isArray(scenario.steps) || scenario.steps.length === 0)
    throw new Error(`Scenario ${scenario.slug} requires at least one step`);

  const scenarioTag = scenario.slug.replaceAll('-', '_');
  const layerStatements = scenario.steps.map((step) => {
    const layer = step.patientProfileLayer;
    const operations = JSON.stringify(layer.operations, null, 2);
    return `insert into public.patient_profile_layers (
  id,
  patient_profile_id,
  title,
  description,
  schema_version,
  operations,
  source_reference,
  source_revision,
  created_at,
  updated_at
) values (
  '${layer.id}',
  '${profileIdentity.profileId}',
  ${sqlText(layer.title)},
  ${layer.description ? sqlText(layer.description) : 'null'},
  ${layer.schemaVersion},
  $layer_operations_${layer.id.replaceAll('-', '_')}$
${operations}
$layer_operations_${layer.id.replaceAll('-', '_')}$::jsonb,
  ${layer.sourceReference ? sqlText(layer.sourceReference) : 'null'},
  ${layer.sourceRevision ? sqlText(layer.sourceRevision) : 'null'},
  '${generatedAt}',
  '${generatedAt}'
) on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  schema_version = excluded.schema_version,
  operations = excluded.operations,
  source_reference = excluded.source_reference,
  source_revision = excluded.source_revision,
  updated_at = excluded.updated_at
where patient_profile_layers.patient_profile_id = excluded.patient_profile_id;`;
  });

  const stepStatements = scenario.steps.map((step) => {
    const ehrChanges = JSON.stringify(step.ehrChanges, null, 2);
    return `insert into public.patient_scenario_steps (
  id,
  scenario_id,
  patient_profile_id,
  position,
  kind,
  title,
  description,
  patient_profile_layer_id,
  ehr_changes,
  created_at,
  updated_at
) select
  '${step.id}',
  scenario.id,
  '${profileIdentity.profileId}',
  ${step.position},
  ${sqlText(step.kind)},
  ${sqlText(step.title)},
  ${step.description ? sqlText(step.description) : 'null'},
  '${step.patientProfileLayer.id}',
  $ehr_changes_${step.id.replaceAll('-', '_')}$
${ehrChanges}
$ehr_changes_${step.id.replaceAll('-', '_')}$::jsonb,
  '${generatedAt}',
  '${generatedAt}'
from public.patient_scenarios scenario
where scenario.scope = 'system'
  and scenario.slug = '${scenario.slug}'
on conflict (id) do update
set
  position = excluded.position,
  kind = excluded.kind,
  title = excluded.title,
  description = excluded.description,
  patient_profile_layer_id = excluded.patient_profile_layer_id,
  ehr_changes = excluded.ehr_changes,
  updated_at = excluded.updated_at
where patient_scenario_steps.scenario_id = excluded.scenario_id
  and patient_scenario_steps.patient_profile_id = excluded.patient_profile_id;`;
  });

  return `insert into public.patient_scenarios (
  id,
  scope,
  slug,
  status,
  patient_profile_id,
  patient_profile_version_id,
  title,
  description,
  care_setting,
  intended_clinical_audiences,
  created_at,
  updated_at
) values (
  '${scenario.id}',
  ${sqlText(scenario.scope)},
  ${sqlText(scenario.slug)},
  ${sqlText(scenario.status)},
  '${profileIdentity.profileId}',
  '${profileIdentity.versionId}',
  ${sqlText(scenario.title)},
  ${sqlText(scenario.description)},
  ${sqlText(scenario.careSetting)},
  array[${scenario.intendedClinicalAudiences.map((audience) => sqlText(audience)).join(', ')}]::text[],
  '${generatedAt}',
  '${generatedAt}'
) on conflict (slug) where scope = 'system' do update
set
  status = excluded.status,
  patient_profile_id = excluded.patient_profile_id,
  patient_profile_version_id = excluded.patient_profile_version_id,
  title = excluded.title,
  description = excluded.description,
  care_setting = excluded.care_setting,
  intended_clinical_audiences = excluded.intended_clinical_audiences,
  updated_at = excluded.updated_at
where patient_scenarios.status = 'draft';

${layerStatements.join('\n\n')}

${stepStatements.join('\n\n')}

do $verify_scenario_${scenarioTag}$
declare
  stored_step_count integer;
begin
  select count(*)
  into stored_step_count
  from public.patient_scenario_steps step
  join public.patient_scenarios scenario on scenario.id = step.scenario_id
  where scenario.scope = 'system'
    and scenario.slug = '${scenario.slug}'
    and scenario.patient_profile_id = '${profileIdentity.profileId}'
    and scenario.patient_profile_version_id = '${profileIdentity.versionId}';

  if stored_step_count <> ${scenario.steps.length} then
    raise exception 'production_patient_scenario_drift:${scenario.slug}';
  end if;
end;
$verify_scenario_${scenarioTag}$;`;
});

const output = `-- Generated by scripts/generate-patient-profile-seed.mjs.
-- Edit the validated JSON sources, then run yarn seed:generate.

begin;

${statements.join('\n\n')}

${scenarioStatements.join('\n\n')}

commit;
`;

if (process.argv.includes('--check')) {
  const current = readFileSync(outputPath, 'utf8');
  if (current !== output) {
    throw new Error('supabase/seeds/production.sql is out of date');
  }
} else {
  writeFileSync(outputPath, output);
}
