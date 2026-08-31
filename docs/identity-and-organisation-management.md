# Identity and organisation management

Status: identity and organisation-management foundation implemented. Institutional
SSO and production operational hardening remain outstanding.

This document records the current architecture and the remaining identity work.
Customer-facing operating guidance lives in `apps/docs`; this file does not
duplicate those instructions.

## Current architecture

Hektor has one durable account model with separate authentication and
organisation-access concerns:

```text
Supabase auth.users                  durable Hektor account
Supabase auth.identities             verified sign-in methods
organisation_users                   organisation membership, role and status
organisation_user_provisions         access prepared by manual, CSV or SCIM flow
organisation_scim_users              stable external directory identity
```

Supabase owns credentials, identity-provider metadata, sessions and verified
identities. Hektor does not copy authentication credentials into application
tables. A user may have memberships in several organisations and a different
role in each. Personal context is the absence of a selected organisation, not a
different user type.

Authentication proves identity but never grants organisation access by itself.
Every organisation operation verifies the active organisation, membership state
and required role at the server boundary. Platform administrators use the
server-controlled `admin` role in Supabase `app_metadata` and can enter an
organisation through recorded platform access without impersonating a member.

Stable identity behavior is typed in `@hektor/config`; contracts are defined in
`@hektor/types`, domain operations in `@hektor/services`, and Next.js Route
Handlers own authentication and HTTP concerns. RLS and tenant-aware services
provide complementary authorization boundaries.

## Done

- [x] Passwordless email-code login, Google OAuth/PKCE login, callback handling,
      logout and authenticated application shell.
- [x] Platform-admin bootstrap, management, suspension/demotion protections and
      platform user/organisation administration.
- [x] Durable multi-organisation memberships with `org_admin`, `tutor` and
      `learner` roles, active/suspended lifecycle and active-context selection.
- [x] Organisation, contract-period and learner-seat management with atomic
      capacity enforcement and retained activation history.
- [x] Cohorts, groups and membership management for platform and organisation
      administrators.
- [x] Manual and CSV provisioning, preview/import validation, invitations,
      private account matching, explicit acceptance and provision lifecycle.
- [x] SCIM 2.0 bearer-token configuration and revocation, discovery endpoints,
      Users, Groups, filtering, pagination, PATCH/lifecycle behavior and idempotent
      synchronization.
- [x] SCIM group mapping to canonical cohorts or groups, including ownership
      tracking, conflict prevention and safe withdrawal of source-owned assignments.
- [x] Tenant isolation policies, role-aware API boundaries and database/service,
      route, component and browser-level coverage for the implemented flows.
- [x] A separate development identity simulator for post-authentication
      institutional acceptance/refusal and real invitation journeys.
- [x] Organisation-administrator documentation for authentication, users,
      provisioning, SCIM, cohorts and groups in the documentation application.

## Important lifecycle rules

- `auth.users` is not deleted when organisation access is suspended or a
  provision is revoked.
- A provision may exist before a Hektor account. It grants no access until linked
  to an accepted, active membership.
- Automatic matching uses a normalized verified email and does not disclose an
  unrelated existing account to an organisation administrator.
- A learner consumes a seat only while their organisation membership is active.
  Suspension releases capacity without deleting history.
- SCIM controls only the provision, source-owned cohort/group assignments and
  membership lifecycle within its organisation. Manual ownership can coexist and
  is not removed by a SCIM change.
- The active workspace is request context, not proof of authorization.
- Local simulation does not implement or weaken the external SAML/OIDC exchange;
  it starts at the trusted identity result and uses production acceptance rules.

Detailed administrator behavior is documented under
`apps/docs/src/content/docs/org-admins`.

## Outstanding

### 1. Institutional SSO

The real institutional authentication exchange is not implemented. Design and
deliver the provider approach before onboarding an institution:

- choose Microsoft OIDC where it meets requirements; use SAML only where needed,
  accounting for Supabase's SAML identity-linking limitations;
- add organisation SSO-connection records and platform onboarding controls;
- define discovery, claims, subject matching, SP/IdP initiated behavior, logout,
  certificate/secret rotation and failure handling;
- connect the verified institutional result to the existing provision acceptance
  and access-refusal services; and
- add provider-contract tests and a controlled preview/production rollout.

Institutional roles and product access must remain provisioned entitlements, not
trusted free-form login claims or inferred email domains.

### 2. Account identity management

- Provide a user-facing view of linked authentication methods.
- Define and implement verified linking/unlinking for identities with different
  email addresses where the provider permits it.
- Specify recovery safeguards so the last usable identity cannot be removed.
- Decide whether MFA is required for platform administrators or institutional
  customers, then implement it through Supabase Auth if required.

Do not enable SAML for a population that requires continuity with personal
accounts until its exceptional reconciliation flow is explicitly designed and
tested.

### 3. Production identity operations

- Replace bootstrap email allowlisting as the normal administrator-assignment
  mechanism once the initial production administrators are established.
- Reconcile and document hosted email, Google and future institutional provider
  configuration for preview and production.
- Add operator runbooks for administrator recovery, provider outage, SCIM token
  compromise/rotation, failed provisioning and tenant offboarding.
- Complete security review of rate limits, request-size limits, abuse controls,
  credential hashing/rotation, PII minimisation and log redaction.
- Define audit-event retention and operator views; current lifecycle timestamps
  and records are not a complete security audit product.
- Add production observability and alerts for authentication, invitation and SCIM
  failure rates.

### 4. Authorization evolution

The current single organisation role is sufficient for the implemented
administration surface. Add capabilities or finer-grained permissions only when
a product slice requires them. EHR preview and assignment delivery will be the
first concrete product entitlements; they must be checked in trusted services
and must not be inferred from seat allowance or UI visibility. Patient-profile
cloning is deferred.

## Next identity milestone

Identity is no longer the critical path for the platform-admin patient-profile
slice. The next identity-specific milestone is an institutional SSO vertical
slice against the existing provisioning acceptance boundary, followed by hosted
configuration, security review and operational readiness. Product entitlement
work can now proceed against the named EHR preview and assignment-delivery
capabilities.
