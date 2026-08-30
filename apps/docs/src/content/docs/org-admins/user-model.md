---
title: Understand users and provisioning
description: Learn how accounts, identities, memberships, seats and provisioning fit together.
sidebar:
  order: 4
---

## The four records involved in access

1. A **user** is the durable Hektor account. Personal accounts exist independently of organisations.
2. An **identity** is a verified way to authenticate that user, such as email, Google or institutional SSO.
3. An **organisation membership** links a user to one organisation and carries the role, cohort and active or suspended state.
4. A **user provision** is an organisation-owned instruction to prepare access. It stores the supplied name, email, intended role and source until reconciliation.

Names and email addresses shown for connected users come from user and identity records, not the historical provision.

## Provision lifecycle

- **Pending:** prepared but not linked to an accepted membership.
- **Linked:** connected to a Hektor account and organisation membership.
- **Inactive:** still linked, but organisation activity is read-only and the seat is not active.
- **Revoked:** permanently ended. Restoring externally managed access creates a new provision while retaining the historical account and work.
- **Failed:** an attempted transition needs administrator attention or retry.

A person can have only one current membership in an organisation. They may have ended historical provisioning records and a later active provision. If a provision arrives for someone with a current membership, Hektor links it rather than creating a duplicate.

## Seats and suspension

Every active organisation membership consumes a seat, whether created manually, by CSV or by SCIM. A linked but inactive provision remains linked but does not consume an active seat. Suspending a membership prevents organisation login and revokes current sessions; it does not delete learning history.

## Roles

- **Learner** uses learning experiences assigned by the organisation.
- **Tutor** supports learners and teaching activity.
- **Organisation admin** manages users, cohorts, groups and provisioning.

Hektor prevents an administrator from demoting or suspending themselves and protects the final active organisation administrator.
