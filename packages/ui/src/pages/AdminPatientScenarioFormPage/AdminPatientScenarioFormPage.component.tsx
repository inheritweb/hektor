'use client';

import { useState, type FormEvent } from 'react';

import {
  PatientCareSetting,
  PatientScenarioClinicalAudience,
} from '@hektor/types';

import { Button, Checkbox, Input, buttonVariants } from '../../atoms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/Select';
import { NavigationLink } from '../../context';

export interface PatientScenarioFormValues {
  title: string;
  slug: string;
  description: string;
  careSetting: PatientCareSetting;
  intendedClinicalAudiences: PatientScenarioClinicalAudience[];
  beginningStepTitle: string;
  beginningStepDescription: string;
}

export interface AdminPatientScenarioFormPageProps {
  cancelHref: string;
  error?: string;
  initialValues?: PatientScenarioFormValues;
  mode: 'create' | 'edit';
  onSubmit: (values: PatientScenarioFormValues) => void;
  patientName: string;
  pending?: boolean;
  previewHref?: string;
  slugError?: string;
  success?: string;
  versionNumber: number;
}

const careSettingLabels: Record<PatientCareSetting, string> = {
  [PatientCareSetting.AcuteInpatient]: 'Acute inpatient',
  [PatientCareSetting.Community]: 'Community',
  [PatientCareSetting.CommunityMentalHealth]: 'Community mental health',
  [PatientCareSetting.Home]: 'Home',
  [PatientCareSetting.Maternity]: 'Maternity',
  [PatientCareSetting.PaediatricCommunity]: 'Paediatric community',
  [PatientCareSetting.Postnatal]: 'Postnatal',
  [PatientCareSetting.PrimaryCare]: 'Primary care',
};

const clinicalAudienceLabels: Record<PatientScenarioClinicalAudience, string> =
  {
    [PatientScenarioClinicalAudience.Nursing]: 'Nursing',
    [PatientScenarioClinicalAudience.Pharmacy]: 'Pharmacy',
    [PatientScenarioClinicalAudience.Medicine]: 'Medicine',
    [PatientScenarioClinicalAudience.AlliedHealth]: 'Allied health',
  };

const emptyValues: PatientScenarioFormValues = {
  title: '',
  slug: '',
  description: '',
  careSetting: PatientCareSetting.AcuteInpatient,
  intendedClinicalAudiences: [],
  beginningStepTitle: '',
  beginningStepDescription: '',
};

function slugify(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
}

export function AdminPatientScenarioFormPage({
  cancelHref,
  error,
  initialValues = emptyValues,
  mode,
  onSubmit,
  patientName,
  pending = false,
  previewHref,
  slugError,
  success,
  versionNumber,
}: AdminPatientScenarioFormPageProps) {
  const [values, setValues] = useState(initialValues);
  const [slugEdited, setSlugEdited] = useState(
    mode === 'edit' || Boolean(initialValues.slug),
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...values,
      title: values.title.trim(),
      slug: values.slug.trim(),
      description: values.description.trim(),
      beginningStepTitle: values.beginningStepTitle.trim(),
      beginningStepDescription: values.beginningStepDescription.trim(),
    });
  };

  return (
    <div className="max-w-3xl">
      <header>
        <p className="text-sm font-semibold text-primary">Patient scenario</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {mode === 'create' ? 'Create scenario' : 'Edit scenario'}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {mode === 'create' ? 'Create' : 'Edit'} a draft for {patientName},
          pinned to profile version {versionNumber}. The patient and version
          cannot be changed.
        </p>
      </header>

      <form className="mt-8 space-y-8" onSubmit={submit}>
        <section
          aria-labelledby="scenario-details-heading"
          className="space-y-5"
        >
          <h2 className="text-xl font-bold" id="scenario-details-heading">
            Scenario details
          </h2>
          <label className="block text-sm font-semibold">
            Title
            <Input
              className="mt-2"
              disabled={pending}
              maxLength={200}
              onChange={(event) => {
                const title = event.target.value;
                setValues((current) => ({
                  ...current,
                  title,
                  ...(!slugEdited ? { slug: slugify(title) } : {}),
                }));
              }}
              required
              value={values.title}
            />
          </label>
          <label className="block text-sm font-semibold">
            Slug
            <Input
              className="mt-2 font-mono"
              disabled={pending}
              maxLength={80}
              onChange={(event) => {
                setSlugEdited(true);
                setValues((current) => ({
                  ...current,
                  slug: event.target.value.toLocaleLowerCase(),
                }));
              }}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
              value={values.slug}
            />
            <span className="mt-2 block font-normal text-muted-foreground">
              Lowercase letters, numbers and single hyphens only.
            </span>
            {slugError ? (
              <span className="mt-2 block font-normal text-destructive">
                {slugError}
              </span>
            ) : null}
          </label>
          <label className="block text-sm font-semibold">
            Description
            <textarea
              className="mt-2 min-h-28 w-full border border-border bg-surface px-3.5 py-3 text-sm font-normal text-surface-foreground shadow-xs outline-none transition-colors hover:bg-accent/20 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pending}
              maxLength={1000}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              required
              value={values.description}
            />
          </label>
          <label className="block text-sm font-semibold">
            Care setting
            <Select
              disabled={pending}
              onValueChange={(careSetting) => {
                if (careSetting)
                  setValues((current) => ({ ...current, careSetting }));
              }}
              value={values.careSetting}
            >
              <SelectTrigger className="mt-2">
                <SelectValue>
                  {careSettingLabels[values.careSetting]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.values(PatientCareSetting).map((careSetting) => (
                  <SelectItem key={careSetting} value={careSetting}>
                    {careSettingLabels[careSetting]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <fieldset>
            <legend className="text-sm font-semibold">
              Intended clinical audiences
            </legend>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional descriptive context; this does not grant access.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {Object.values(PatientScenarioClinicalAudience).map(
                (audience) => (
                  <label
                    className="flex items-center gap-3 text-sm"
                    key={audience}
                  >
                    <Checkbox
                      checked={values.intendedClinicalAudiences.includes(
                        audience,
                      )}
                      disabled={pending}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          intendedClinicalAudiences: event.target.checked
                            ? [...current.intendedClinicalAudiences, audience]
                            : current.intendedClinicalAudiences.filter(
                                (value) => value !== audience,
                              ),
                        }))
                      }
                    />
                    {clinicalAudienceLabels[audience]}
                  </label>
                ),
              )}
            </div>
          </fieldset>
        </section>

        <section aria-labelledby="beginning-step-heading" className="space-y-5">
          <div>
            <h2 className="text-xl font-bold" id="beginning-step-heading">
              Beginning step
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === 'create'
                ? 'This creates an empty starting layer.'
                : 'This describes the existing beginning state.'}{' '}
              Clinical changes and EHR configuration are managed separately.
            </p>
          </div>
          <label className="block text-sm font-semibold">
            Beginning-step title
            <Input
              className="mt-2"
              disabled={pending}
              maxLength={200}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  beginningStepTitle: event.target.value,
                }))
              }
              required
              value={values.beginningStepTitle}
            />
          </label>
          <label className="block text-sm font-semibold">
            Beginning-step description
            <textarea
              className="mt-2 min-h-24 w-full border border-border bg-surface px-3.5 py-3 text-sm font-normal text-surface-foreground shadow-xs outline-none transition-colors hover:bg-accent/20 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pending}
              maxLength={1000}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  beginningStepDescription: event.target.value,
                }))
              }
              value={values.beginningStepDescription}
            />
          </label>
        </section>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="text-sm text-primary" role="status">
            {success}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button disabled={pending} type="submit">
            {pending
              ? mode === 'create'
                ? 'Creating…'
                : 'Saving…'
              : mode === 'create'
                ? 'Create scenario'
                : 'Save changes'}
          </Button>
          {previewHref ? (
            <NavigationLink
              className={buttonVariants({ variant: 'outline' })}
              href={previewHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              Preview in EHR
            </NavigationLink>
          ) : null}
          <NavigationLink
            className={buttonVariants({ variant: 'outline' })}
            href={cancelHref}
          >
            Cancel
          </NavigationLink>
        </div>
      </form>
    </div>
  );
}
