---
title: Manage groups
description: Create groups and maintain connected and provisioned membership.
sidebar:
  order: 10
---

Groups organise users within an organisation and may belong to a cohort. Hektor presents one group concept whether locally or externally managed; the source determines which fields can be edited.

## Create a local group

1. Choose **Groups**.
2. Choose **Add group**.
3. Enter the group name.
4. Optionally select an active cohort.
5. Save the group.

## Add or remove connected users

1. Open an active, Hektor-managed group.
2. Choose **Manage users**.
3. Search users already connected to this organisation.
4. Tick users who should belong and clear users who should not.
5. Save the selection.

The search never exposes accounts outside the selected organisation.

## Add or remove pending provisioned users

1. Open the group.
2. Choose **Manage provisioned users**.
3. Search provisioned users belonging to this organisation.
4. Select or clear the required records.
5. Save the selection.

When a provision links to a user, its group relationship follows it into the connected membership.

## Edit or archive a group

1. Open the group and choose **Edit group**.
2. Change its name, cohort or status.
3. Save the form.

Archiving removes the group from normal active use without deleting historical relationships.

Incoming SCIM groups are mapped to canonical Hektor groups from **Users**, **Manage provisioning**, **Configure SCIM**. Their source-owned membership is read-only here and must be changed in the identity provider. Manual membership can coexist and is not removed when SCIM withdraws its copy of the relationship.
