---
title: Provision users manually
description: Invite one person, import CSV data and manage outstanding invitations.
sidebar:
  order: 7
---

A provision prepares organisation access without exposing Hektor accounts outside your organisation. Use manual provisioning for individual invitations, CSV for controlled bulk import, or [SCIM](./scim/) when an identity provider should control lifecycle changes.

## Invite one person

1. Choose **Users**.
2. Choose **Manage provisioning**, then **Invite user**.
3. Enter the person's first name, last name and email address.
4. Select **Learner**, **Tutor** or **Organisation admin**.
5. Choose whether to send the invitation now.
6. Submit the form and review the provision detail.

Hektor may privately link the provision to an existing verified account and current membership. This does not expose that account in search or disclose whether it existed beforehand.

## Import a CSV

1. Create a UTF-8 CSV with this header:

   ```csv
   first_name,last_name,email,role,cohort
   ```

2. Add one person per row. `first_name`, `last_name`, `email` and `role` are required; `cohort` is optional.
3. Use `learner`, `tutor` or `org_admin` as the role.
4. If supplied, make the cohort name match an active cohort in this organisation.
5. Choose **Users**, **Manage provisioning** and **Import CSV**.
6. Select the file and review the preview. Hektor accepts up to 500 rows.
7. Correct invalid rows in the source file and preview it again.
8. Confirm the ready rows.

The preview distinguishes ready, invalid and unchanged rows without revealing whether a row matches an account outside your organisation.

## Send invitations in bulk

1. Choose **Users**, **Manage provisioning** and **Manage invitations**.
2. Filter the provision directory if necessary.
3. Tick individual pending provisioned users, or select all records matching the current filters.
4. Choose **Send invitations** and confirm.

The selection applies to the filtered result on the server, including matching records on later pages. A new invitation invalidates the earlier token.

## Manage one provision

Open a provisioned user from **Manage provisioning**. Depending on its state, you can:

- send or resend an invitation;
- deactivate linked access, leaving organisation work read-only;
- reactivate inactive access;
- revoke provisioned access permanently; or
- retry a failed transition.

Fields managed by SCIM remain controlled by SCIM. Correct them in the source directory and synchronize again.
