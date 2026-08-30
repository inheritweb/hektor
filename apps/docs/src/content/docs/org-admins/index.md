---
title: Organisation administrators
description: Configure and operate your organisation's Hektor workspace.
sidebar:
  order: 1
---

Organisation administrators manage access, users, cohorts, groups and provisioning for one organisation. Platform administration is a separate responsibility and is not covered here.

## How Hektor is organised

One Hektor account can belong to several organisations. Signing in establishes one session; the workspace selected in the account switcher determines which organisation you are administering. You do not need to authenticate again when you switch.

User access is deliberately split into separate records:

- A **Hektor account** is the person's platform identity and sign-in history.
- An **organisation membership** connects that account to your organisation, assigns its role and consumes a seat while active.
- A **provision** is your organisation's prepared access record. It can exist before the person has a Hektor account and may be created manually, from CSV or through SCIM.
- A **cohort** represents a dated learning population. A **group** organises a subset of users and may belong to a cohort.

Organisation administrators cannot search Hektor accounts outside their organisation. When a provision matches an existing verified account, Hektor reconciles it privately.

## Start here

1. [Enter and switch organisation workspaces](./getting-started/).
2. [Understand authentication and invitations](./authentication/).
3. [Understand the user and provisioning model](./user-model/).
4. Choose a provisioning method: [manual or CSV](./provisions/), or [automated SCIM](./scim/).
5. [Administer connected users](./users/).
6. [Manage cohorts](./cohorts/) and [groups](./groups/).

The [dashboard](./dashboard/) shows current totals and links to each management area.
