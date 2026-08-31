# Accounts, products, and entitlements

This document records the direction of travel for Hektor's account and product
model. It is intentionally specific about shared foundations and deliberately
non-committal about products that have not yet been designed.

## Product principles

- A user owns one durable Hektor account independently of any university.
- A user may authenticate through several login identities, including personal
  and institutional accounts.
- Organisation membership grants a context in which the user can act. It does
  not own or replace the user's account.
- Removing or suspending an organisation membership must not delete the user,
  their other memberships, or personally owned data.
- Roles answer what somebody may do inside an organisation. Entitlements answer
  which product capabilities they may use and who sponsors that access.
- Data records its owner, controlling context, and transfer rules explicitly.
  These rules must not be inferred from the user's current email domain.

## Identity foundation — done

Supabase `auth.users` is the durable Hektor account and `auth.identities` holds
its email and OAuth login methods. Supabase automatically links identities with
the same verified email and supports explicit linking of OAuth identities with
different emails.

`User` is the dominant application entity and exists independently of any
organisation. `OrganisationMembership` belongs to the organisation domain and
associates an organisation with a user. A separate provision can remain pending
and unlinked before first login. The same membership can be traversed from a
platform user view or an organisation's people view.

Personal access is a context, not a user subtype or container. The initial
personal authentication methods are passwordless email code and Google OAuth;
passwords and authenticator-app MFA are outside the initial scope.

Hektor uses `organisation_users` to associate the user with each organisation
in which they participate. The active context is selected from `personal` or
one of the user's active organisation memberships.

Identity linking across different email addresses is an explicit, verified
operation through Supabase Auth. Hektor must never merge users merely because names or institutional
email addresses look similar.

Supabase excludes SAML SSO users from automatic and manual identity linking.
Prefer Microsoft OAuth/OIDC where it satisfies an institution's requirements.
If SAML and personal-account continuity are both required, design that
exceptional reconciliation flow before enabling the connection.

An organisation can retain an inactive historical membership after somebody
moves institution. The new organisation creates an independent membership for
the same user. SCIM only controls the membership and groups within the SCIM
connection's organisation.

## Access foundation — done

Public sign-up creates a personal account. The initial free allowance is a
product entitlement, provisionally allowing the user to explore three patient
records. The precise counting event will be decided with the EHR product model;
it should not be encoded in the user or organisation tables yet.

Institutional roles remain `org_admin`, `tutor`, and `learner`. `admin` remains
a platform-wide role on trusted authentication metadata. A user can hold
different organisation roles in different organisations.

The active organisation is presentation and request context, not authorization.
Every server operation must still verify the selected membership and required
role. The selector should persist, but an unavailable or suspended selection
falls back to personal context.

## Shared product foundation

The eventual common commercial model should distinguish products and
capabilities, plans, entitlement grants, sponsors, beneficiaries, usage limits,
measurement periods, and ownership of product data. Sponsors may be users or
organisations; beneficiaries may include users, organisations, cohorts, or
groups.

This is a capability model rather than a `licence_type` field on a user. We will
introduce its tables only when the first EHR capability and usage rule are clear
enough to test.

## Product horizon

### Clinical documentation learning

The first product teaches learners how to read and create the documentation that
follows a patient. It may grow beyond an electronic patient record simulation.
The free personal experience is the adoption path; universities sponsor wider
learner access and teaching features.

### Professional portfolio

A professional diary begins during training and may continue throughout a
nurse's career. While studying, an institution may control specific assessed
sections. On leaving, the durable portfolio remains available to the user.
This needs explicit item-level ownership, stewardship, visibility, and transfer
rules before implementation.

### Curriculum mapping

A teacher-focused tool can compare assignment plans with regulatory requirements
to expose gaps and weak coverage. It may be a free or freemium adoption tool.

### Simulated practice planning

The simulation-day planning ideas explored in Hascle may become another product.
It should reuse users, organisations, cohorts, groups, identity, and entitlement
foundations without forcing its workflow into the EHR model.

## Delivery status

1. [x] Establish Supabase accounts and multi-organisation membership.
2. [x] Add passwordless email and Google sign-in with bootstrap platform-admin
       elevation.
3. [x] Surface the signed-in user and active context in the application shell.
4. [x] Add manual, CSV and SCIM provisioning, membership lifecycle, groups,
       cohorts and learner-seat enforcement.
5. [ ] Define the first EHR capabilities for published EHR preview and assignment
       delivery, including the personal free allowance and institutional grants.
6. [ ] Add product and entitlement persistence from those concrete rules.
7. [ ] Implement institutional SSO and any exceptional identity reconciliation
       required by the chosen provider.
8. [ ] Design ownership and transfer for the professional portfolio before
       storing portfolio content.

Detailed completed and outstanding identity work is tracked in
`docs/identity-and-organisation-management.md`.
