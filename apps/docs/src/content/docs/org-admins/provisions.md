---
title: Invite and provision users
description: Reserve organisation places and manage invitations without exposing accounts outside your organisation.
sidebar:
  order: 6
---

Choose **Users**, then **Manage provisions**, to review the identities your organisation has prepared for access to Hektor. A provision records the intended name, email address, organisation role and lifecycle state before or alongside an organisation user connection.

Choose **Invite user** to create a provision. You can send the invitation immediately or leave it pending and send it later from the provision detail page. Hektor privately reconciles the provision when the person can already be connected; organisation administrators cannot search or inspect accounts outside their organisation.

Choose **Import CSV** to prepare up to 500 people at once. The required columns are `first_name`, `last_name`, `email` and `role`; the optional `cohort` column is matched against an active cohort in your organisation. Preview validation identifies invalid or unchanged rows, but never discloses whether a ready row matches an existing Hektor account.

Use **Manage invitations** to send or resend invitations for multiple pending provisions. Invitation links expire and a newly sent invitation replaces the previous link.

An active linked provision can be deactivated, making the organisation connection read-only without removing its history. It can later be reactivated. Revoking a provision ends that provision permanently; a provisioning source may create a new provision if access is granted again.

Provisioned fields managed by an external source remain controlled by that source. SCIM configuration and synchronization are covered separately.
