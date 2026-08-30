---
title: Understand authentication
description: Understand sign-in methods, invitations and authentication configuration responsibilities.
sidebar:
  order: 3
---

Authentication proves who a person is. Provisioning and organisation membership decide whether that person may enter your organisation. SCIM does not authenticate users.

## Supported sign-in methods

Hektor currently supports:

- a six-digit passwordless email code, valid for ten minutes;
- Google sign-in; and
- an institutional identity returned through an approved institutional sign-in flow.

Email and Google provider settings are platform-wide. Organisation administrators cannot change SMTP, Google OAuth or redirect configuration from their workspace.

## Choose how a provisioned person enters Hektor

1. **Institutional sign-in:** provision the person first. After the institution verifies the identity, Hektor finds the matching provision and asks the person to confirm joining. If neither an account nor a provision exists, Hektor refuses access and explains that no seat has been reserved.
2. **Invitation email:** create a provision and send an invitation. The tokenised link verifies the provisioned email and presents the join confirmation. Use this when institutional sign-in is unavailable or the institution provisions a different address from the person's usual Hektor login.

If the person already has a verified Hektor account, Hektor can connect the provision privately. If not, successful verification creates the account before the membership is accepted. Organisation administrators are not told whether an unrelated platform account existed.

## Send or resend an invitation

1. Choose **Users**, then **Manage provisioning**.
2. Open the provision.
3. Choose **Send invitation** or **Resend invitation**.
4. Ask the recipient to use the newest email; sending again invalidates the earlier link.

See [Provision users manually](./provisions/) for bulk invitation management.

## Configuration responsibilities

An organisation administrator configures access inputs—provisioning, roles, cohorts, invitations and SCIM—but not authentication providers. A platform operator configures email delivery, Google OAuth and institutional identity-provider trust. Provide that operator with the institution's issuer, verified domains and redirect requirements when institutional authentication is enabled.

Never use an email domain alone as proof of membership. Hektor requires a verified identity and an explicit provision or active membership.
