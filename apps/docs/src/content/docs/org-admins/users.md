---
title: Administer connected users
description: Review user access, roles, cohorts, groups, seats and status.
sidebar:
  order: 8
---

## Find a connected user

1. Select the correct organisation in the account switcher.
2. Choose **Users**.
3. Search or page through the directory.
4. Review both **Platform status** and **Organisation seat status**.
5. Select a row to open the membership detail.

Only users connected to the selected organisation are returned. Organisation administrators cannot search the platform-wide directory.

## Review access

The detail page shows organisation role, cohort, groups, provisioning source, platform status and seat status. A platform account and an organisation membership are different: changing organisation access does not delete the personal account.

## Change a membership

1. Open the user and choose **Edit membership**.
2. Change the role, cohort or membership status.
3. Save the form.

Hektor detects concurrent updates and refuses to overwrite a newer change. Reload, review the current values and apply the change again.

Externally managed role or cohort values must be changed at their source. Hektor also prevents you from suspending or demoting yourself and protects the final active organisation administrator.

## Suspend or restore access

Set the membership to **Suspended** to prevent organisation login and revoke active sessions. Existing work remains associated with the organisation and becomes effectively read-only. Restore **Active** to permit access again, subject to seat availability.

For someone not yet connected, choose **Manage provisioning** and follow [manual provisioning](./provisions/) or [SCIM configuration](./scim/).
