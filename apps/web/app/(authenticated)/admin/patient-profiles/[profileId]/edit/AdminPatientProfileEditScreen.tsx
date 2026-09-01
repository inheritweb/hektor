'use client';

import { useState } from 'react';

import {
  useAdminPatientProfile,
  useUpdateAdminPatientProfileDraft,
} from '@hektor/query/patient-profiles';
import {
  AuthoredValueStatus,
  PatientAllergyRecordStatus,
  PatientAllergySeverity,
  PatientAllergyVerificationStatus,
  PatientBackgroundCategory,
  PatientCareSetting,
  PatientClinicalStatus,
  PatientDataSensitivity,
  PatientLifeStage,
  PatientLanguageProficiency,
  PatientMedicationStatus,
  PatientProfileTag,
  PatientRelationshipRole,
  PatientSpecialty,
  PatientSexAtBirth,
  type PatientProfileDocumentV1,
} from '@hektor/types';
import { Button, Checkbox, Input } from '@hektor/ui/atoms';
import { NavigationLink } from '@hektor/ui/context';

import { PatientHistoryEditor } from './PatientHistoryEditor';

const label = (value: string) => value.replaceAll('_', ' ');

const newItemId = () => crypto.randomUUID();

const commaSeparated = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export function AdminPatientProfileEditScreen({
  profileId,
}: {
  profileId: string;
}) {
  const profile = useAdminPatientProfile({ params: { profileId } });
  if (profile.isPending)
    return (
      <div
        aria-label="Loading patient profile"
        className="h-96 animate-pulse bg-accent/40"
      />
    );
  if (profile.isError)
    return (
      <p className="text-sm text-destructive" role="alert">
        {profile.error.message}
      </p>
    );

  if (!profile.data) return null;

  return (
    <AdminPatientProfileEditForm
      initialChangeSummary={profile.data.data.changeSummary}
      initialDocument={profile.data.data.document}
      key={profile.data.data.updatedAt}
      profileId={profileId}
      updatedAt={profile.data.data.updatedAt}
    />
  );
}

function AdminPatientProfileEditForm({
  initialChangeSummary,
  initialDocument,
  profileId,
  updatedAt,
}: {
  initialChangeSummary: string;
  initialDocument: PatientProfileDocumentV1;
  profileId: string;
  updatedAt: string;
}) {
  const update = useUpdateAdminPatientProfileDraft();
  const [document, setDocument] = useState(initialDocument);
  const [changeSummary, setChangeSummary] = useState(initialChangeSummary);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  const toggle = <T extends string>(values: T[], value: T) =>
    values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];
  const save = () =>
    update.mutate(
      {
        params: { profileId },
        body: {
          document,
          changeSummary,
          expectedUpdatedAt: updatedAt,
        },
      },
      {
        onError: (next) => setError(next.message),
        onSuccess: () => setSaved(true),
      },
    );

  return (
    <form
      className="mx-auto max-w-4xl space-y-10"
      onSubmit={(event) => {
        event.preventDefault();
        setError(undefined);
        setSaved(false);
        save();
      }}
    >
      <header>
        <p className="text-sm font-semibold text-primary">Patient profile</p>
        <h1 className="mt-1 text-3xl font-bold">Edit draft</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Edit the patient through bounded clinical sections. Changes remain a
          draft.
        </p>
      </header>
      <section>
        <h2 className="text-xl font-bold">Identity and contact</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label>
            Given names
            <Input
              className="mt-1"
              value={document.identity.givenNames.join(' ')}
              onChange={(event) =>
                setDocument({
                  ...document,
                  identity: {
                    ...document.identity,
                    givenNames: event.target.value.split(/\s+/).filter(Boolean),
                  },
                })
              }
            />
          </label>
          <label>
            Family name
            <Input
              className="mt-1"
              value={document.identity.familyName}
              onChange={(event) =>
                setDocument({
                  ...document,
                  identity: {
                    ...document.identity,
                    familyName: event.target.value,
                  },
                })
              }
            />
          </label>
          <label>
            Preferred name
            <Input
              className="mt-1"
              value={document.identity.preferredName ?? ''}
              onChange={(event) =>
                setDocument({
                  ...document,
                  identity: {
                    ...document.identity,
                    preferredName: event.target.value || undefined,
                  },
                })
              }
            />
          </label>
          <label>
            Date of birth
            <Input
              className="mt-1"
              type="date"
              value={document.identity.dateOfBirth}
              onChange={(event) =>
                setDocument({
                  ...document,
                  identity: {
                    ...document.identity,
                    dateOfBirth: event.target.value,
                  },
                })
              }
            />
          </label>
          <label>
            Sex at birth
            <select
              className="mt-1 h-11 w-full border border-border bg-paper px-3"
              value={
                document.identity.sexAtBirth?.status === 'known'
                  ? document.identity.sexAtBirth.value
                  : ''
              }
              onChange={(event) =>
                setDocument({
                  ...document,
                  identity: {
                    ...document.identity,
                    sexAtBirth: event.target.value
                      ? {
                          status: AuthoredValueStatus.Known,
                          value: event.target.value as PatientSexAtBirth,
                        }
                      : undefined,
                  },
                })
              }
            >
              <option value="">Not recorded</option>
              {Object.values(PatientSexAtBirth).map((value) => (
                <option key={value} value={value}>
                  {label(value)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Phone
            <Input
              className="mt-1"
              value={document.contact?.phone ?? ''}
              onChange={(event) =>
                setDocument({
                  ...document,
                  contact: {
                    ...document.contact,
                    phone: event.target.value || undefined,
                  },
                })
              }
            />
          </label>
          <label>
            Email
            <Input
              className="mt-1"
              type="email"
              value={document.contact?.email ?? ''}
              onChange={(event) =>
                setDocument({
                  ...document,
                  contact: {
                    ...document.contact,
                    email: event.target.value || undefined,
                  },
                })
              }
            />
          </label>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold">Communication and background</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Record communication requirements and the stable contextual facts that
          inform every learning experience built from this patient.
        </p>
        <div className="mt-4 space-y-4">
          <div className="border-b border-border pb-2">
            <h3 className="font-semibold">Languages</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Languages, proficiency and the patient&apos;s preferred language.
            </p>
          </div>
          {document.communication.languages.map((language, index) => (
            <div
              className="grid gap-3 rounded border border-border p-4 md:grid-cols-3"
              key={language.id}
            >
              <label>
                Language
                <Input
                  className="mt-1"
                  value={language.language.display}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      communication: {
                        ...document.communication,
                        languages: document.communication.languages.map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  language: {
                                    ...item.language,
                                    display: event.target.value,
                                  },
                                }
                              : item,
                        ),
                      },
                    })
                  }
                />
              </label>
              <label>
                Proficiency
                <select
                  className="mt-1 h-11 w-full border border-border bg-paper px-3"
                  value={language.proficiency ?? ''}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      communication: {
                        ...document.communication,
                        languages: document.communication.languages.map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  proficiency:
                                    (event.target
                                      .value as PatientLanguageProficiency) ||
                                    undefined,
                                }
                              : item,
                        ),
                      },
                    })
                  }
                >
                  <option value="">Not recorded</option>
                  {Object.values(PatientLanguageProficiency).map((value) => (
                    <option key={value} value={value}>
                      {label(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-end gap-2 pb-3">
                <Checkbox
                  checked={
                    document.communication.preferredLanguageId === language.id
                  }
                  onChange={() =>
                    setDocument({
                      ...document,
                      communication: {
                        ...document.communication,
                        preferredLanguageId:
                          document.communication.preferredLanguageId ===
                          language.id
                            ? undefined
                            : language.id,
                      },
                    })
                  }
                />{' '}
                Preferred language
              </label>
              <Button
                className="md:col-span-3"
                onClick={() =>
                  setDocument({
                    ...document,
                    communication: {
                      ...document.communication,
                      languages: document.communication.languages.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                      preferredLanguageId:
                        document.communication.preferredLanguageId ===
                        language.id
                          ? undefined
                          : document.communication.preferredLanguageId,
                    },
                  })
                }
                type="button"
                variant="secondary"
              >
                Remove language
              </Button>
            </div>
          ))}
          <Button
            onClick={() =>
              setDocument({
                ...document,
                communication: {
                  ...document.communication,
                  languages: [
                    ...document.communication.languages,
                    { id: newItemId(), language: { display: '' } },
                  ],
                },
              })
            }
            type="button"
            variant="secondary"
          >
            Add language
          </Button>
          <div className="border-b border-border pb-2 pt-4">
            <h3 className="font-semibold">Communication preferences</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Preferences that help clinicians communicate effectively.
            </p>
          </div>
          {document.communication.preferences.map((need, index) => (
            <div className="flex gap-3" key={need.id}>
              <Input
                className="flex-1"
                value={need.summary}
                onChange={(event) =>
                  setDocument({
                    ...document,
                    communication: {
                      ...document.communication,
                      preferences: document.communication.preferences.map(
                        (item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, summary: event.target.value }
                            : item,
                      ),
                    },
                  })
                }
              />
              <Button
                onClick={() =>
                  setDocument({
                    ...document,
                    communication: {
                      ...document.communication,
                      preferences: document.communication.preferences.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    },
                  })
                }
                type="button"
                variant="secondary"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            onClick={() =>
              setDocument({
                ...document,
                communication: {
                  ...document.communication,
                  preferences: [
                    ...document.communication.preferences,
                    { id: newItemId(), summary: '' },
                  ],
                },
              })
            }
            type="button"
            variant="secondary"
          >
            Add communication preference
          </Button>
          <div className="border-b border-border pb-2 pt-4">
            <h3 className="font-semibold">Accessibility needs</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Reasonable adjustments and other enduring accessibility needs.
            </p>
          </div>
          {document.communication.accessibilityNeeds.map((need, index) => (
            <div className="flex gap-3" key={need.id}>
              <Input
                className="flex-1"
                value={need.summary}
                onChange={(event) =>
                  setDocument({
                    ...document,
                    communication: {
                      ...document.communication,
                      accessibilityNeeds:
                        document.communication.accessibilityNeeds.map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, summary: event.target.value }
                              : item,
                        ),
                    },
                  })
                }
              />
              <Button
                onClick={() =>
                  setDocument({
                    ...document,
                    communication: {
                      ...document.communication,
                      accessibilityNeeds:
                        document.communication.accessibilityNeeds.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                    },
                  })
                }
                type="button"
                variant="secondary"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            onClick={() =>
              setDocument({
                ...document,
                communication: {
                  ...document.communication,
                  accessibilityNeeds: [
                    ...document.communication.accessibilityNeeds,
                    { id: newItemId(), summary: '' },
                  ],
                },
              })
            }
            type="button"
            variant="secondary"
          >
            Add accessibility need
          </Button>
          <div className="border-b border-border pb-2 pt-4">
            <h3 className="font-semibold">Relationships</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Family, carers, next of kin and other significant people.
            </p>
          </div>
          {document.relationships.map((relationship, index) => (
            <div
              className="grid gap-3 rounded border border-border p-4 md:grid-cols-3"
              key={relationship.id}
            >
              <label>
                Name
                <Input
                  className="mt-1"
                  value={relationship.name}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      relationships: document.relationships.map(
                        (item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, name: event.target.value }
                            : item,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Relationship
                <Input
                  className="mt-1"
                  value={relationship.relationship.display}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      relationships: document.relationships.map(
                        (item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                relationship: {
                                  ...item.relationship,
                                  display: event.target.value,
                                },
                              }
                            : item,
                      ),
                    })
                  }
                />
              </label>
              <fieldset>
                <legend>Roles</legend>
                <div className="mt-1 flex flex-wrap gap-3">
                  {Object.values(PatientRelationshipRole).map((role) => (
                    <label className="flex items-center gap-1" key={role}>
                      <Checkbox
                        checked={relationship.roles.includes(role)}
                        onChange={() =>
                          setDocument({
                            ...document,
                            relationships: document.relationships.map(
                              (item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      roles: item.roles.includes(role)
                                        ? item.roles.filter(
                                            (value) => value !== role,
                                          )
                                        : [...item.roles, role],
                                    }
                                  : item,
                            ),
                          })
                        }
                      />
                      {label(role)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Button
                className="md:col-span-3"
                onClick={() =>
                  setDocument({
                    ...document,
                    relationships: document.relationships.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  })
                }
                type="button"
                variant="secondary"
              >
                Remove relationship
              </Button>
            </div>
          ))}
          <Button
            onClick={() =>
              setDocument({
                ...document,
                relationships: [
                  ...document.relationships,
                  {
                    id: newItemId(),
                    name: '',
                    relationship: { display: '' },
                    roles: [],
                  },
                ],
              })
            }
            type="button"
            variant="secondary"
          >
            Add relationship
          </Button>
          <div className="border-b border-border pb-2 pt-4">
            <h3 className="font-semibold">Background facts</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Social, cultural, family and other durable personal context.
            </p>
          </div>
          {document.background.map((fact, index) => (
            <div
              className="grid gap-3 rounded border border-border p-4 md:grid-cols-3"
              key={fact.id}
            >
              <label>
                Category
                <select
                  className="mt-1 h-11 w-full border border-border bg-paper px-3"
                  value={fact.category}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      background: document.background.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              category: event.target
                                .value as PatientBackgroundCategory,
                            }
                          : item,
                      ),
                    })
                  }
                >
                  {Object.values(PatientBackgroundCategory).map((value) => (
                    <option key={value} value={value}>
                      {label(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="md:col-span-2">
                Summary
                <Input
                  className="mt-1"
                  value={fact.summary}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      background: document.background.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, summary: event.target.value }
                          : item,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Sensitivity
                <select
                  className="mt-1 h-11 w-full border border-border bg-paper px-3"
                  value={fact.sensitivity}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      background: document.background.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              sensitivity: event.target
                                .value as PatientDataSensitivity,
                            }
                          : item,
                      ),
                    })
                  }
                >
                  {Object.values(PatientDataSensitivity).map((value) => (
                    <option key={value} value={value}>
                      {label(value)}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                className="self-end"
                onClick={() =>
                  setDocument({
                    ...document,
                    background: document.background.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  })
                }
                type="button"
                variant="secondary"
              >
                Remove fact
              </Button>
            </div>
          ))}
          <Button
            onClick={() =>
              setDocument({
                ...document,
                background: [
                  ...document.background,
                  {
                    id: newItemId(),
                    category: PatientBackgroundCategory.Social,
                    summary: '',
                    sensitivity: PatientDataSensitivity.Standard,
                  },
                ],
              })
            }
            type="button"
            variant="secondary"
          >
            Add background fact
          </Button>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold">Clinical history</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Problems, allergies and regular medicines are maintained as separate
          structured records.
        </p>
        <div className="mt-4 space-y-4">
          {document.problems.map((problem, index) => (
            <div
              className="grid gap-3 rounded border border-border p-4 md:grid-cols-3"
              key={problem.id}
            >
              <label>
                Problem
                <Input
                  className="mt-1"
                  value={problem.problem.display}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      problems: document.problems.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              problem: {
                                ...item.problem,
                                display: event.target.value,
                              },
                            }
                          : item,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Status
                <select
                  className="mt-1 h-11 w-full border border-border bg-paper px-3"
                  value={problem.clinicalStatus}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      problems: document.problems.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              clinicalStatus: event.target
                                .value as PatientClinicalStatus,
                            }
                          : item,
                      ),
                    })
                  }
                >
                  {Object.values(PatientClinicalStatus).map((value) => (
                    <option key={value} value={value}>
                      {label(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Onset date
                <Input
                  className="mt-1"
                  type="date"
                  value={problem.onsetDate ?? ''}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      problems: document.problems.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              onsetDate: event.target.value || undefined,
                            }
                          : item,
                      ),
                    })
                  }
                />
              </label>
              <Button
                className="md:col-span-3"
                onClick={() =>
                  setDocument({
                    ...document,
                    problems: document.problems.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  })
                }
                type="button"
                variant="secondary"
              >
                Remove problem
              </Button>
            </div>
          ))}
          <Button
            onClick={() =>
              setDocument({
                ...document,
                problems: [
                  ...document.problems,
                  {
                    id: newItemId(),
                    problem: { display: '' },
                    clinicalStatus: PatientClinicalStatus.Active,
                  },
                ],
              })
            }
            type="button"
            variant="secondary"
          >
            Add problem
          </Button>
          <label className="text-sm font-medium">
            Allergy record status
            <select
              className="mt-1 w-full rounded border border-border bg-background px-3 py-2"
              value={document.allergyRecordStatus}
              onChange={(event) => {
                const allergyRecordStatus = event.target
                  .value as PatientAllergyRecordStatus;
                setDocument({
                  ...document,
                  allergyRecordStatus,
                  allergies:
                    allergyRecordStatus ===
                    PatientAllergyRecordStatus.KnownAllergies
                      ? document.allergies
                      : [],
                });
              }}
            >
              {Object.values(PatientAllergyRecordStatus).map((value) => (
                <option key={value} value={value}>
                  {label(value)}
                </option>
              ))}
            </select>
          </label>
          {document.allergies.map((allergy, index) => (
            <div
              className="grid gap-3 rounded border border-border p-4 md:grid-cols-3"
              key={allergy.id}
            >
              <label>
                Substance
                <Input
                  className="mt-1"
                  value={allergy.substance.display}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      allergies: document.allergies.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              substance: {
                                ...item.substance,
                                display: event.target.value,
                              },
                            }
                          : item,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Verification
                <select
                  className="mt-1 h-11 w-full border border-border bg-paper px-3"
                  value={allergy.verificationStatus}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      allergies: document.allergies.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              verificationStatus: event.target
                                .value as PatientAllergyVerificationStatus,
                            }
                          : item,
                      ),
                    })
                  }
                >
                  {Object.values(PatientAllergyVerificationStatus).map(
                    (value) => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Severity
                <select
                  className="mt-1 h-11 w-full border border-border bg-paper px-3"
                  value={allergy.severity ?? ''}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      allergies: document.allergies.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              severity:
                                (event.target
                                  .value as PatientAllergySeverity) ||
                                undefined,
                            }
                          : item,
                      ),
                    })
                  }
                >
                  <option value="">Not recorded</option>
                  {Object.values(PatientAllergySeverity).map((value) => (
                    <option key={value} value={value}>
                      {label(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="md:col-span-2">
                Reactions (comma separated)
                <Input
                  className="mt-1"
                  value={allergy.reactions.join(', ')}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      allergies: document.allergies.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              reactions: commaSeparated(event.target.value),
                            }
                          : item,
                      ),
                    })
                  }
                />
              </label>
              <Button
                onClick={() => {
                  const allergies = document.allergies.filter(
                    (_, itemIndex) => itemIndex !== index,
                  );
                  setDocument({
                    ...document,
                    allergies,
                    allergyRecordStatus: allergies.length
                      ? PatientAllergyRecordStatus.KnownAllergies
                      : PatientAllergyRecordStatus.NotRecorded,
                  });
                }}
                type="button"
                variant="secondary"
              >
                Remove allergy
              </Button>
            </div>
          ))}
          <Button
            onClick={() =>
              setDocument({
                ...document,
                allergyRecordStatus: PatientAllergyRecordStatus.KnownAllergies,
                allergies: [
                  ...document.allergies,
                  {
                    id: newItemId(),
                    substance: { display: '' },
                    clinicalStatus: PatientClinicalStatus.Active,
                    verificationStatus:
                      PatientAllergyVerificationStatus.Unconfirmed,
                    reactions: [],
                  },
                ],
              })
            }
            type="button"
            variant="secondary"
          >
            Add allergy
          </Button>
          {document.baselineMedications.map((medication, index) => (
            <div
              className="grid gap-3 rounded border border-border p-4 md:grid-cols-3"
              key={medication.id}
            >
              <label>
                Medicine
                <Input
                  className="mt-1"
                  value={medication.medication.display}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      baselineMedications: document.baselineMedications.map(
                        (item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                medication: {
                                  ...item.medication,
                                  display: event.target.value,
                                },
                              }
                            : item,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Status
                <select
                  className="mt-1 h-11 w-full border border-border bg-paper px-3"
                  value={medication.status}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      baselineMedications: document.baselineMedications.map(
                        (item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                status: event.target
                                  .value as PatientMedicationStatus,
                              }
                            : item,
                      ),
                    })
                  }
                >
                  {Object.values(PatientMedicationStatus).map((value) => (
                    <option key={value} value={value}>
                      {label(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Dose
                <Input
                  className="mt-1"
                  value={medication.dose ?? ''}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      baselineMedications: document.baselineMedications.map(
                        (item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, dose: event.target.value || undefined }
                            : item,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Frequency
                <Input
                  className="mt-1"
                  value={medication.frequency ?? ''}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      baselineMedications: document.baselineMedications.map(
                        (item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                frequency: event.target.value || undefined,
                              }
                            : item,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Indication
                <Input
                  className="mt-1"
                  value={medication.indication ?? ''}
                  onChange={(event) =>
                    setDocument({
                      ...document,
                      baselineMedications: document.baselineMedications.map(
                        (item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                indication: event.target.value || undefined,
                              }
                            : item,
                      ),
                    })
                  }
                />
              </label>
              <Button
                onClick={() =>
                  setDocument({
                    ...document,
                    baselineMedications: document.baselineMedications.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  })
                }
                type="button"
                variant="secondary"
              >
                Remove medicine
              </Button>
            </div>
          ))}
          <Button
            onClick={() =>
              setDocument({
                ...document,
                baselineMedications: [
                  ...document.baselineMedications,
                  {
                    id: newItemId(),
                    medication: { display: '' },
                    status: PatientMedicationStatus.Active,
                  },
                ],
              })
            }
            type="button"
            variant="secondary"
          >
            Add medicine
          </Button>
        </div>
      </section>
      <PatientHistoryEditor
        entries={document.history.entries}
        onChange={(entries) =>
          setDocument({ ...document, history: { entries } })
        }
      />
      <section>
        <h2 className="text-xl font-bold">Catalogue classification</h2>
        <label className="mt-4 block">
          Life stage
          <select
            className="mt-1 h-11 w-full border border-border bg-paper px-3"
            value={document.catalogue.lifeStage}
            onChange={(event) =>
              setDocument({
                ...document,
                catalogue: {
                  ...document.catalogue,
                  lifeStage: event.target.value as PatientLifeStage,
                },
              })
            }
          >
            {Object.values(PatientLifeStage).map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </select>
        </label>
        {(
          [
            ['Care settings', PatientCareSetting, 'careSettings'],
            ['Specialties', PatientSpecialty, 'specialties'],
            ['Tags', PatientProfileTag, 'tags'],
          ] as const
        ).map(([heading, values, key]) => (
          <fieldset className="mt-5" key={heading}>
            <legend className="font-semibold">{heading}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {Object.values(values).map((value) => (
                <label className="flex items-center gap-2" key={value}>
                  <Checkbox
                    checked={document.catalogue[key].includes(value as never)}
                    onChange={() =>
                      setDocument({
                        ...document,
                        catalogue: {
                          ...document.catalogue,
                          [key]: toggle(
                            document.catalogue[key] as string[],
                            value,
                          ),
                        },
                      })
                    }
                  />
                  {label(value)}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </section>
      <section>
        <h2 className="text-xl font-bold">Save draft</h2>
        <label className="mt-4 block">
          Change summary
          <Input
            className="mt-1"
            value={changeSummary}
            onChange={(event) => setChangeSummary(event.target.value)}
            required
          />
        </label>
        {error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="mt-3 text-sm text-primary" role="status">
            Draft saved.
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button disabled={update.isPending} type="submit">
            {update.isPending ? 'Saving…' : 'Save draft'}
          </Button>
          <NavigationLink
            className="inline-flex h-11 items-center px-4 text-sm font-semibold text-primary"
            href={`/admin/patient-profiles/${profileId}`}
          >
            Cancel
          </NavigationLink>
        </div>
      </section>
    </form>
  );
}
