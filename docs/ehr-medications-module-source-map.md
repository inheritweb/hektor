# EHR medications / medicines optimisation module source map

## Boundary

This generic EHR module projects the selected Patient Profile version's
`baselineMedications`. It represents durable medicines at the profile boundary,
not a prescription chart, medicines administration record or completed
reconciliation.

Scenario layers may later add, stop or clarify medicines for a particular
presentation. Those changes must resolve into the same module without changing
the base profile.

## Prototype evidence retained

Esther Jenkins' prototype medicines presentation establishes the visual and
clinical pattern used here:

- a compact, scan-friendly table;
- dose, route, frequency and indication shown independently;
- prominent allergy context alongside medicines;
- incomplete or uncertain details left visible; and
- adherence and verification notes retained rather than normalised away.

The responsive view changes the table to complete medicine cards at narrow
widths. It does not remove fields.

## Patient Profile projection

| EHR content                                 | Patient Profile source                         |
| ------------------------------------------- | ---------------------------------------------- |
| Medicine                                    | `baselineMedications[].medication.display`     |
| Status                                      | `baselineMedications[].status`                 |
| Dose                                        | `baselineMedications[].dose`                   |
| Route                                       | `baselineMedications[].route.display`          |
| Frequency                                   | `baselineMedications[].frequency`              |
| Indication                                  | `baselineMedications[].indication`             |
| Adherence, uncertainty or verification note | `baselineMedications[].details`                |
| Safety context                              | `allergyRecordStatus` and active `allergies[]` |

Active medicines are displayed before other statuses while source order is
preserved within each group. Missing values are explicitly labelled **Not
recorded**. An empty list is labelled **No baseline medications recorded**; it
must not be interpreted as evidence that the patient takes no medicines.

## Deferred

- scenario and episode medicines;
- prescribing and administration;
- medicines reconciliation workflow;
- interaction or dose checking;
- terminology search/typeahead; and
- learner-authored medicines activities.
