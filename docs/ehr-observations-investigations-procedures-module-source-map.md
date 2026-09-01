# EHR observations, investigations and procedures module source map

## Boundary

This module projects durable pre-scenario records from:

- `history.entries[type=observation]`;
- `history.entries[type=investigation]`; and
- `history.entries[type=procedure]`.

It does not show observations, tests, results or procedures created by the
current presentation unless a future Patient Profile layer supplies them.

## Prototype reconciliation

The prototype presents observations and investigation results as dense,
scan-friendly clinical tables. Values, units, reference ranges and abnormal
flags remain visually adjacent. Investigation conclusions and narrative reports
remain readable beneath discrete results.

Esther's prototype includes admission observations, NEWS2 input, blood results,
ECG and CT head findings. All arise from her acute stroke scenario and therefore
must not be copied into the base profile. Her durable home blood-pressure record
does appear.

The other seeded profiles demonstrate durable examples:

- Adebayo has historical observations;
- Amina has antenatal investigations and discrete glucose results; and
- Emma has a historical cardiac procedure and staging investigation.

## Projection

Observations display name, value, unit, reference range, interpretation, date and
context. Investigations display kind, status, discrete results, conclusion,
dates, author and sensitivity. Procedures display name, indication, outcome,
complications, dates, author and sensitivity.

Source order is retained. Missing values are labelled **Not recorded** and empty
investigation result arrays are not interpreted as a negative result.

## Deferred

- scenario and current-episode clinical records;
- NEWS2 and other calculation engines;
- learner entry and validation;
- result trend charts;
- clinical decision support; and
- specialty-specific report viewers.
