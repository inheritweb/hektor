---
title: Configure SCIM user provisioning
description: Connect an identity provider and operate automated user lifecycle synchronization.
sidebar:
  order: 6
---

SCIM lets an identity provider create, update, deactivate and restore organisation access. Hektor currently implements SCIM 2.0 **Users**. SCIM Groups and cohort/group mapping are planned but are not available in this release.

## Before you begin

- Select the organisation you intend to configure.
- Confirm that your identity provider accepts a SCIM 2.0 base URL and bearer token.
- Decide which Hektor role new users should receive by default.
- Ensure the provider sends a stable external identifier, verified email address, given name, family name and active state.

## Generate a connection

1. Choose **Users**.
2. Choose **Manage provisioning**, then **Configure SCIM**.
3. Copy the **SCIM base URL** into the provider's tenant URL or base URL field.
4. Choose the default role: **Learner**, **Tutor** or **Organisation admin**.
5. Choose **Save defaults**.
6. Choose **Generate token**.
7. Copy the bearer token immediately into the identity provider. Hektor does not display it again.
8. Use the provider's connection test, if available.

The connection is scoped to the selected organisation. Do not reuse its token for another organisation.

## Configure the identity provider

Use these values where the provider asks for them:

- **Base URL:** the complete URL shown by Hektor.
- **Authentication:** bearer token.
- **User identifier:** a stable provider identifier; never reuse it for another person.
- **User name:** the person's verified email address.
- **Name:** given and family names.
- **Active:** `true` while access remains enabled and `false` when access is withdrawn.

Enable create, update and deactivate operations. Run a small assigned test population first, inspect the resulting provision, and only then expand the provider assignment.

## Verify synchronization

1. Assign a test person in the identity provider.
2. Run or wait for provisioning.
3. In Hektor, choose **Users** and **Manage provisioning**.
4. Find the provision and confirm its **SCIM** source, name, email, role and state.
5. If it has no connected membership, have the person use institutional sign-in or send an invitation from the provision detail.
6. Once accepted or privately reconciled, confirm the person appears in **Users** with the expected seat and platform statuses.

Creating the same SCIM user again is idempotent: Hektor updates its stable SCIM record rather than creating duplicates. If a current membership already exists, Hektor links the provision to it.

## Deactivate and restore access

When the provider sends `active: false`, Hektor deactivates the provision, suspends the linked membership, revokes active access and preserves organisation history as read-only. When the provider later sends `active: true`, Hektor creates a fresh active provision against the historical account and restores the membership, subject to available seats.

Make SCIM-managed name, email, role and lifecycle corrections in the source directory and synchronize again.

## Rotate or revoke the token

To rotate a credential:

1. Open **Configure SCIM**.
2. Choose **Rotate token** and copy the new value.
3. Replace the token in the identity provider immediately.
4. Test the connection. The old token stops working as soon as rotation completes.

To stop synchronization, choose **Revoke token**. Revocation rejects future SCIM calls but does not delete users, provisioning records, memberships or history already synchronized.

## Troubleshoot

- **401 Unauthorized:** generate or rotate the token and update the provider's bearer credential.
- **A user is not present:** confirm the person is assigned to the provider application and inspect its provisioning log.
- **A user remains inactive:** confirm the provider sent `active: true` and that the organisation can allocate a seat.
- **Names or email are wrong:** correct the source identity and synchronize again.
- **Groups do not synchronize:** SCIM Groups are not supported in the current release; manage groups and cohorts in Hektor for now.
