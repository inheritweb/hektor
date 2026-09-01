'use client';

import {
  PatientClinicalDocumentType,
  PatientDataSensitivity,
  PatientHistoricalCarePlanCategory,
  PatientHistoricalCarePlanStatus,
  PatientHistoricalEncounterType,
  PatientHistoricalMedicationStatus,
  PatientHistoryDatePrecision,
  PatientHistoryEntryType,
  PatientInvestigationKind,
  PatientInvestigationStatus,
  PatientObservationInterpretation,
  PatientObservationValueType,
  PatientReferralStatus,
  type PatientHistoricalDate,
  type PatientHistoryEntry,
  type PatientObservationValue,
} from '@hektor/types';
import { Button, Checkbox, Input } from '@hektor/ui/atoms';

const label = (value: string) => value.replaceAll('_', ' ');

const newItemId = () => crypto.randomUUID();

const lines = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const textareaClass =
  'mt-1 min-h-24 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30';

function defaultEntry(
  type: PatientHistoryEntryType,
  existing?: Pick<PatientHistoryEntry, 'id' | 'summary'>,
): PatientHistoryEntry {
  const base = {
    id: existing?.id ?? newItemId(),
    summary: existing?.summary ?? '',
    sensitivity: PatientDataSensitivity.Standard,
  };
  switch (type) {
    case PatientHistoryEntryType.Encounter:
      return {
        ...base,
        type,
        encounterType: PatientHistoricalEncounterType.Other,
      };
    case PatientHistoryEntryType.Observation:
      return {
        ...base,
        type,
        observation: { display: '' },
        value: { type: PatientObservationValueType.Text, value: '' },
      };
    case PatientHistoryEntryType.Assessment:
      return {
        ...base,
        type,
        assessment: { display: '' },
        outcome: '',
      };
    case PatientHistoryEntryType.Investigation:
      return {
        ...base,
        type,
        kind: PatientInvestigationKind.Other,
        investigation: { display: '' },
        status: PatientInvestigationStatus.Final,
        results: [],
      };
    case PatientHistoryEntryType.Procedure:
      return { ...base, type, procedure: { display: '' } };
    case PatientHistoryEntryType.MedicationCourse:
      return {
        ...base,
        type,
        medication: { display: '' },
        status: PatientHistoricalMedicationStatus.Unknown,
      };
    case PatientHistoryEntryType.Referral:
      return {
        ...base,
        type,
        status: PatientReferralStatus.Requested,
        referredTo: '',
        reason: '',
      };
    case PatientHistoryEntryType.ClinicalDocument:
      return {
        ...base,
        type,
        documentType: PatientClinicalDocumentType.ClinicalNote,
        title: '',
        body: '',
      };
    case PatientHistoryEntryType.CarePlan:
      return {
        ...base,
        type,
        category: PatientHistoricalCarePlanCategory.CareAndSupport,
        status: PatientHistoricalCarePlanStatus.Completed,
        need: '',
        goals: [],
        interventions: [],
      };
  }
}

function HistoryDateField({
  date,
  onChange,
}: {
  date?: PatientHistoricalDate;
  onChange: (date?: PatientHistoricalDate) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
      <select
        className="h-11 border border-border bg-paper px-3"
        value={date?.precision ?? PatientHistoryDatePrecision.Day}
        onChange={(event) =>
          onChange({
            precision: event.target.value as PatientHistoryDatePrecision,
            value: date?.value ?? '',
            ...(date?.approximate ? { approximate: true } : {}),
          })
        }
      >
        {Object.values(PatientHistoryDatePrecision).map((value) => (
          <option key={value} value={value}>
            {label(value)}
          </option>
        ))}
      </select>
      <Input
        placeholder={
          date?.precision === PatientHistoryDatePrecision.Year
            ? 'YYYY'
            : date?.precision === PatientHistoryDatePrecision.Month
              ? 'YYYY-MM'
              : 'YYYY-MM-DD'
        }
        value={date?.value ?? ''}
        onChange={(event) =>
          onChange(
            event.target.value
              ? {
                  precision: date?.precision ?? PatientHistoryDatePrecision.Day,
                  value: event.target.value,
                  ...(date?.approximate ? { approximate: true } : {}),
                }
              : undefined,
          )
        }
      />
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={date?.approximate ?? false}
          disabled={!date}
          onChange={() =>
            date && onChange({ ...date, approximate: !date.approximate })
          }
        />
        Approximate
      </label>
    </div>
  );
}

function ObservationValueFields({
  onChange,
  value,
}: {
  onChange: (value: PatientObservationValue) => void;
  value: PatientObservationValue;
}) {
  const changeType = (type: PatientObservationValueType) => {
    if (type === PatientObservationValueType.Quantity)
      onChange({ type, value: 0, unit: '' });
    else if (type === PatientObservationValueType.Boolean)
      onChange({ type, value: false });
    else if (type === PatientObservationValueType.Coded)
      onChange({ type, value: { display: '' } });
    else onChange({ type, value: '' });
  };
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <select
        className="h-11 border border-border bg-paper px-3"
        value={value.type}
        onChange={(event) =>
          changeType(event.target.value as PatientObservationValueType)
        }
      >
        {Object.values(PatientObservationValueType).map((option) => (
          <option key={option} value={option}>
            {label(option)}
          </option>
        ))}
      </select>
      {value.type === PatientObservationValueType.Boolean ? (
        <select
          className="h-11 border border-border bg-paper px-3 sm:col-span-2"
          value={String(value.value)}
          onChange={(event) =>
            onChange({ ...value, value: event.target.value === 'true' })
          }
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      ) : value.type === PatientObservationValueType.Quantity ? (
        <>
          <Input
            type="number"
            value={value.value}
            onChange={(event) =>
              onChange({ ...value, value: Number(event.target.value) })
            }
          />
          <Input
            placeholder="Unit"
            value={value.unit}
            onChange={(event) =>
              onChange({ ...value, unit: event.target.value })
            }
          />
        </>
      ) : (
        <Input
          className="sm:col-span-2"
          value={
            value.type === PatientObservationValueType.Coded
              ? value.value.display
              : value.value
          }
          onChange={(event) =>
            onChange(
              value.type === PatientObservationValueType.Coded
                ? { ...value, value: { display: event.target.value } }
                : { ...value, value: event.target.value },
            )
          }
        />
      )}
    </div>
  );
}

export function PatientHistoryEditor({
  entries,
  onChange,
}: {
  entries: PatientHistoryEntry[];
  onChange: (entries: PatientHistoryEntry[]) => void;
}) {
  const replace = (index: number, entry: PatientHistoryEntry) =>
    onChange(
      entries.map((item, itemIndex) => (itemIndex === index ? entry : item)),
    );

  return (
    <section>
      <h2 className="text-xl font-bold">Patient history</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Edit clinical records from before the current episode. Current-episode
        data does not belong here.
      </p>
      <div className="mt-4 space-y-5">
        {entries.map((entry, index) => (
          <fieldset
            className="space-y-4 rounded border border-border p-4"
            key={entry.id}
          >
            <legend className="px-2 font-semibold">{label(entry.type)}</legend>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                Record type
                <select
                  className="mt-1 h-11 w-full border border-border bg-paper px-3"
                  value={entry.type}
                  onChange={(event) =>
                    replace(
                      index,
                      defaultEntry(
                        event.target.value as PatientHistoryEntryType,
                        entry,
                      ),
                    )
                  }
                >
                  {Object.values(PatientHistoryEntryType).map((value) => (
                    <option key={value} value={value}>
                      {label(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sensitivity
                <select
                  className="mt-1 h-11 w-full border border-border bg-paper px-3"
                  value={entry.sensitivity}
                  onChange={(event) =>
                    replace(index, {
                      ...entry,
                      sensitivity: event.target.value as PatientDataSensitivity,
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
              <label className="md:col-span-2">
                Summary
                <Input
                  className="mt-1"
                  value={entry.summary}
                  onChange={(event) =>
                    replace(index, { ...entry, summary: event.target.value })
                  }
                />
              </label>
              <label className="md:col-span-2">
                Details
                <textarea
                  className={textareaClass}
                  value={entry.details ?? ''}
                  onChange={(event) =>
                    replace(index, {
                      ...entry,
                      details: event.target.value || undefined,
                    })
                  }
                />
              </label>
              <label className="md:col-span-2">
                Occurred from
                <HistoryDateField
                  date={entry.occurred?.start}
                  onChange={(start) =>
                    replace(index, {
                      ...entry,
                      occurred: start
                        ? { ...entry.occurred, start }
                        : entry.occurred?.end
                          ? { end: entry.occurred.end }
                          : undefined,
                    })
                  }
                />
              </label>
              <label className="md:col-span-2">
                Occurred to
                <HistoryDateField
                  date={entry.occurred?.end}
                  onChange={(end) =>
                    replace(index, {
                      ...entry,
                      occurred: end
                        ? { ...entry.occurred, end }
                        : entry.occurred?.start
                          ? { start: entry.occurred.start }
                          : undefined,
                    })
                  }
                />
              </label>
            </div>

            {entry.type === PatientHistoryEntryType.Encounter ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  Encounter type
                  <select
                    className="mt-1 h-11 w-full border border-border bg-paper px-3"
                    value={entry.encounterType}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        encounterType: event.target
                          .value as PatientHistoricalEncounterType,
                      })
                    }
                  >
                    {Object.values(PatientHistoricalEncounterType).map(
                      (value) => (
                        <option key={value} value={value}>
                          {label(value)}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  Service
                  <Input
                    className="mt-1"
                    value={entry.service ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        service: event.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label>
                  Reason
                  <Input
                    className="mt-1"
                    value={entry.reason ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        reason: event.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label>
                  Outcome
                  <Input
                    className="mt-1"
                    value={entry.outcome ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        outcome: event.target.value || undefined,
                      })
                    }
                  />
                </label>
              </div>
            ) : null}
            {entry.type === PatientHistoryEntryType.Observation ? (
              <div className="space-y-3">
                <label>
                  Observation
                  <Input
                    className="mt-1"
                    value={entry.observation.display}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        observation: {
                          ...entry.observation,
                          display: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <ObservationValueFields
                  value={entry.value}
                  onChange={(value) => replace(index, { ...entry, value })}
                />
                <label>
                  Interpretation
                  <select
                    className="mt-1 h-11 w-full border border-border bg-paper px-3"
                    value={entry.interpretation ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        interpretation:
                          (event.target
                            .value as PatientObservationInterpretation) ||
                          undefined,
                      })
                    }
                  >
                    <option value="">Not recorded</option>
                    {Object.values(PatientObservationInterpretation).map(
                      (value) => (
                        <option key={value} value={value}>
                          {label(value)}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>
            ) : null}
            {entry.type === PatientHistoryEntryType.Assessment ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  Assessment
                  <Input
                    className="mt-1"
                    value={entry.assessment.display}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        assessment: {
                          ...entry.assessment,
                          display: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Outcome
                  <Input
                    className="mt-1"
                    value={entry.outcome}
                    onChange={(event) =>
                      replace(index, { ...entry, outcome: event.target.value })
                    }
                  />
                </label>
                <label>
                  Score
                  <Input
                    className="mt-1"
                    type="number"
                    value={entry.score ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        score: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      })
                    }
                  />
                </label>
                <label>
                  Scale
                  <Input
                    className="mt-1"
                    value={entry.scale ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        scale: event.target.value || undefined,
                      })
                    }
                  />
                </label>
              </div>
            ) : null}
            {entry.type === PatientHistoryEntryType.Investigation ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <label>
                    Investigation
                    <Input
                      className="mt-1"
                      value={entry.investigation.display}
                      onChange={(event) =>
                        replace(index, {
                          ...entry,
                          investigation: {
                            ...entry.investigation,
                            display: event.target.value,
                          },
                        })
                      }
                    />
                  </label>
                  <label>
                    Kind
                    <select
                      className="mt-1 h-11 w-full border border-border bg-paper px-3"
                      value={entry.kind}
                      onChange={(event) =>
                        replace(index, {
                          ...entry,
                          kind: event.target.value as PatientInvestigationKind,
                        })
                      }
                    >
                      {Object.values(PatientInvestigationKind).map((value) => (
                        <option key={value} value={value}>
                          {label(value)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Status
                    <select
                      className="mt-1 h-11 w-full border border-border bg-paper px-3"
                      value={entry.status}
                      onChange={(event) =>
                        replace(index, {
                          ...entry,
                          status: event.target
                            .value as PatientInvestigationStatus,
                        })
                      }
                    >
                      {Object.values(PatientInvestigationStatus).map(
                        (value) => (
                          <option key={value} value={value}>
                            {label(value)}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                </div>
                {entry.results.map((result, resultIndex) => (
                  <div
                    className="space-y-2 border-l-2 border-border pl-3"
                    key={result.id}
                  >
                    <Input
                      value={result.observation.display}
                      onChange={(event) =>
                        replace(index, {
                          ...entry,
                          results: entry.results.map((item, itemIndex) =>
                            itemIndex === resultIndex
                              ? {
                                  ...item,
                                  observation: {
                                    ...item.observation,
                                    display: event.target.value,
                                  },
                                }
                              : item,
                          ),
                        })
                      }
                    />
                    <ObservationValueFields
                      value={result.value}
                      onChange={(value) =>
                        replace(index, {
                          ...entry,
                          results: entry.results.map((item, itemIndex) =>
                            itemIndex === resultIndex
                              ? { ...item, value }
                              : item,
                          ),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        replace(index, {
                          ...entry,
                          results: entry.results.filter(
                            (_, itemIndex) => itemIndex !== resultIndex,
                          ),
                        })
                      }
                    >
                      Remove result
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    replace(index, {
                      ...entry,
                      results: [
                        ...entry.results,
                        {
                          id: newItemId(),
                          observation: { display: '' },
                          value: {
                            type: PatientObservationValueType.Text,
                            value: '',
                          },
                        },
                      ],
                    })
                  }
                >
                  Add result
                </Button>
                <label>
                  Conclusion
                  <Input
                    className="mt-1"
                    value={entry.conclusion ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        conclusion: event.target.value || undefined,
                      })
                    }
                  />
                </label>
              </div>
            ) : null}
            {entry.type === PatientHistoryEntryType.Procedure ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  Procedure
                  <Input
                    className="mt-1"
                    value={entry.procedure.display}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        procedure: {
                          ...entry.procedure,
                          display: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Indication
                  <Input
                    className="mt-1"
                    value={entry.indication ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        indication: event.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label>
                  Outcome
                  <Input
                    className="mt-1"
                    value={entry.outcome ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        outcome: event.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label>
                  Complications
                  <Input
                    className="mt-1"
                    value={entry.complications ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        complications: event.target.value || undefined,
                      })
                    }
                  />
                </label>
              </div>
            ) : null}
            {entry.type === PatientHistoryEntryType.MedicationCourse ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  Medicine
                  <Input
                    className="mt-1"
                    value={entry.medication.display}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        medication: {
                          ...entry.medication,
                          display: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Status
                  <select
                    className="mt-1 h-11 w-full border border-border bg-paper px-3"
                    value={entry.status}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        status: event.target
                          .value as PatientHistoricalMedicationStatus,
                      })
                    }
                  >
                    {Object.values(PatientHistoricalMedicationStatus).map(
                      (value) => (
                        <option key={value} value={value}>
                          {label(value)}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  Dose
                  <Input
                    className="mt-1"
                    value={entry.dose ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        dose: event.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label>
                  Frequency
                  <Input
                    className="mt-1"
                    value={entry.frequency ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        frequency: event.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label>
                  Indication
                  <Input
                    className="mt-1"
                    value={entry.indication ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        indication: event.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label>
                  Reason ended
                  <Input
                    className="mt-1"
                    value={entry.reasonEnded ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        reasonEnded: event.target.value || undefined,
                      })
                    }
                  />
                </label>
              </div>
            ) : null}
            {entry.type === PatientHistoryEntryType.Referral ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  Status
                  <select
                    className="mt-1 h-11 w-full border border-border bg-paper px-3"
                    value={entry.status}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        status: event.target.value as PatientReferralStatus,
                      })
                    }
                  >
                    {Object.values(PatientReferralStatus).map((value) => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Referred to
                  <Input
                    className="mt-1"
                    value={entry.referredTo}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        referredTo: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Referred from
                  <Input
                    className="mt-1"
                    value={entry.referredFrom ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        referredFrom: event.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label>
                  Reason
                  <Input
                    className="mt-1"
                    value={entry.reason}
                    onChange={(event) =>
                      replace(index, { ...entry, reason: event.target.value })
                    }
                  />
                </label>
                <label>
                  Outcome
                  <Input
                    className="mt-1"
                    value={entry.outcome ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        outcome: event.target.value || undefined,
                      })
                    }
                  />
                </label>
              </div>
            ) : null}
            {entry.type === PatientHistoryEntryType.ClinicalDocument ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  Document type
                  <select
                    className="mt-1 h-11 w-full border border-border bg-paper px-3"
                    value={entry.documentType}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        documentType: event.target
                          .value as PatientClinicalDocumentType,
                      })
                    }
                  >
                    {Object.values(PatientClinicalDocumentType).map((value) => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Title
                  <Input
                    className="mt-1"
                    value={entry.title}
                    onChange={(event) =>
                      replace(index, { ...entry, title: event.target.value })
                    }
                  />
                </label>
                <label className="md:col-span-2">
                  Body
                  <textarea
                    className={textareaClass}
                    value={entry.body}
                    onChange={(event) =>
                      replace(index, { ...entry, body: event.target.value })
                    }
                  />
                </label>
              </div>
            ) : null}
            {entry.type === PatientHistoryEntryType.CarePlan ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  Category
                  <select
                    className="mt-1 h-11 w-full border border-border bg-paper px-3"
                    value={entry.category}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        category: event.target
                          .value as PatientHistoricalCarePlanCategory,
                      })
                    }
                  >
                    {Object.values(PatientHistoricalCarePlanCategory).map(
                      (value) => (
                        <option key={value} value={value}>
                          {label(value)}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  Status
                  <select
                    className="mt-1 h-11 w-full border border-border bg-paper px-3"
                    value={entry.status}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        status: event.target
                          .value as PatientHistoricalCarePlanStatus,
                      })
                    }
                  >
                    {Object.values(PatientHistoricalCarePlanStatus).map(
                      (value) => (
                        <option key={value} value={value}>
                          {label(value)}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  Need
                  <Input
                    className="mt-1"
                    value={entry.need}
                    onChange={(event) =>
                      replace(index, { ...entry, need: event.target.value })
                    }
                  />
                </label>
                <label>
                  Goals (one per line)
                  <textarea
                    className={textareaClass}
                    value={entry.goals.join('\n')}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        goals: lines(event.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Interventions (one per line)
                  <textarea
                    className={textareaClass}
                    value={entry.interventions.join('\n')}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        interventions: lines(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="md:col-span-2">
                  Evaluation
                  <Input
                    className="mt-1"
                    value={entry.evaluation ?? ''}
                    onChange={(event) =>
                      replace(index, {
                        ...entry,
                        evaluation: event.target.value || undefined,
                      })
                    }
                  />
                </label>
              </div>
            ) : null}

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                onChange(entries.filter((_, itemIndex) => itemIndex !== index))
              }
            >
              Remove history record
            </Button>
          </fieldset>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            onChange([
              ...entries,
              defaultEntry(PatientHistoryEntryType.Encounter),
            ])
          }
        >
          Add history record
        </Button>
      </div>
    </section>
  );
}
