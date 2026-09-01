# EHR About me module source map

Status: implemented for the five current Patient Profiles.

## Generic boundary

**About me (personalised context)** presents durable person-centred information
that helps someone understand and work with the patient: home and independence,
roles, interests, culture, faith, important relationships, communication
preferences and accessibility support.

It does not contain the current presentation, clinical problems, risk flags,
episode observations, learner questions or care plans. Sensitive facts are not
automatically repeated here merely because they exist elsewhere in the record.

## Prototype evidence

The prototype distributes equivalent content across differently named panels:

- **Esther Jenkins:** Patient Details occupation/social context, pre-admission
  independence, Social Work home context and “What matters to Esther”.
- **Adam Marsden:** Social Circumstances & Support, accommodation, support
  network, education and communication adjustments.
- **Adebayo Omolade:** Social History, occupation/roles/interests, spirituality,
  family support and communication preferences.
- **Amina Warsame:** social context, family involvement, Muslim faith, halal
  food and culturally responsive care.
- **Emma Barlow:** Social History, personality and preferences, play interests,
  comfort/communication preferences and important carers.

This confirms that About me is a generic module even though the prototype has
no consistent section with that name.

## Current projection

The module reads only existing `PatientProfileDocumentV1` data:

- selected background entries: occupation, living arrangements, social,
  education, culture, family and relevant authored life experience;
- faith or belief;
- relationships and support notes; and
- communication preferences and accessibility needs.

Neutral missing-data language refers only to whether that particular category
has been recorded. It does not assert that the patient has no preferences,
beliefs, support or personal context.

## Deferred

- patient-authored “what matters to me” fields with stronger provenance;
- sensitivity-aware audience presentation;
- current-presentation effects on independence or preferences;
- learner-entered person-centred observations; and
- scenario or professional-view configuration.
