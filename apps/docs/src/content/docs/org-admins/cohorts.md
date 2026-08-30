---
title: Manage cohorts
description: Create, edit, archive and review dated learning populations.
sidebar:
  order: 9
---

A cohort is an organisation-owned, dated learning population. Groups may belong to a cohort, and learner memberships or pending provisioned users may be associated with it.

## Create a cohort

1. Choose **Cohorts**.
2. Choose **Add cohort**.
3. Enter a unique, recognisable name.
4. Enter start and end dates. The end date must be later than the start date.
5. Save the cohort.

Create cohorts before importing a CSV that refers to them by name.

## Review a cohort

1. Choose **Cohorts** and select the cohort.
2. Review its dates and status.
3. Review its associated groups and learners.
4. For learners, distinguish platform account status from organisation seat status.

## Edit or archive a cohort

1. Open the cohort and choose **Edit cohort**.
2. Change its name, dates or status.
3. Save the form.

Archiving removes the cohort from normal active selection without deleting history. Hektor detects concurrent edits; reload and review if another administrator changed it while your form was open.

## Assign users and groups

- Assign a connected learner by editing their membership from **Users**.
- Assign a provisioned learner when creating or importing the provision.
- Assign a locally managed group by editing the group.

Externally managed assignments must be changed at their source and synchronized again.

To drive cohort membership from a directory group, open **Users**, **Manage provisioning**, **Configure SCIM**, and map the incoming group directly to this cohort. Hektor does not create an intermediate group. Removing the mapping withdraws only SCIM-owned cohort assignments; manual assignments remain.
