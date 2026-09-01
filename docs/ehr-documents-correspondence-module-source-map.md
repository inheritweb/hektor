# EHR documents and correspondence module source map

## Boundary

This module projects durable authored records from
`history.entries[type=clinical_document]` where `documentType` is `letter`,
`discharge_summary` or `other`.

Clinical notes and handovers belong to **Multi-professional communication**.
Structured investigation results remain in **Observations, investigations and
procedures**, even when the prototype styles a report like a letter.

## Prototype reconciliation

Sarah Williams provides the richest generic correspondence reference. Her
**Clinic Letters** section presents a chronological stack with originating
organisation and department, author, recipient context, date, full body,
signature and copied recipients. Farhana Iqbal provides a focused secondary-to-
primary-care example through her pre-populated endoscopy discharge letter.

These examples establish the module as a readable document surface rather than
a compact table or a learner form. The current generic record model preserves
title, document type, summary, full authored body, date, author/role/service and
sensitivity. Recipient and copied-recipient fields are not yet structured and
must not be inferred from prose.

## Current five-profile projection

None of the five current base Patient Profiles contains a durable letter,
discharge summary or other clinical correspondence. Esther's acute admission
documents, Amina's postnatal discharge communication and any later Emma CYPACP
correspondence belong to scenario layers unless a source document predates the
chosen profile boundary and is explicitly imported.

## Empty-state meaning

**No durable document or correspondence is recorded in this base Patient
Profile** means only that no qualifying source document has been imported before
the scenario boundary. It does not imply that the person has no documents in a
scenario or in another source system.

## Deferred

- structured sender, recipient, copied-recipient and destination fields;
- attachments, binary files, MIME types and document preview/download;
- document status, supersession, amendment and signature workflow;
- scenario-layer referral letters, reports and discharge correspondence; and
- learner-authored correspondence activities.
