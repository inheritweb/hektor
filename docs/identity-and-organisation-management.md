# Identity and organisation management

Status: Draft

This document defines Hektor's institutional identity, provisioning, platform
administration, and organisation-management architecture. Technical design
comes first; the ordered implementation plan follows it.

## Technical design

### 1. System boundaries

Hektor uses one identity system with two deliberately separate trust paths:

```text
Institutional users                       Hektor platform administrators
Microsoft Entra ID                        Google
        │                                    │
        │ SAML 2.0                           │ OAuth 2.0 / OpenID Connect
        ▼                                    ▼
                         Supabase Auth
                               │
                               ▼
                     Hektor application identity
                               │
                               ▼
                  organisation user and roles
```

Microsoft Entra authenticates university users. Entra's provisioning service
also calls Hektor's SCIM 2.0 API to maintain their application identities,
groups, `organisation_users` records, roles, and active state. Authentication
does not itself grant institutional access: a matching active provisioned
organisation user is required.

Passwordless email codes and Google authenticate personal users. Google also
authenticates Hektor's own platform administrators. An allowlisted Google
identity is elevated to the platform-wide `admin` role; email identities and
other Google identities retain ordinary personal access.

#### User model

Hektor uses `auth.users` as its durable user account and `auth.identities` for
the login methods associated with it. Supabase owns credentials, identity
linking, provider metadata, and authentication sessions; Hektor does not copy
those fields into a profile or authentication-link table.

Hektor's canonical `User` is a global domain entity projected from Supabase
Auth. `OrganisationMembership` belongs to the organisation domain and
associates an organisation with a user; it does not define or own the user.
"Personal" describes the active context when no organisation membership is
selected, not a separate user kind.

Locally, Supabase renders Hektor's versioned passwordless email template and
delivers it to Mailpit. Hosted delivery will use custom SMTP, initially
considering Resend. A future provider-neutral messaging package should follow
the established adapter pattern—validated messages with fake, SMTP, and hosted
provider adapters—but Supabase Auth remains responsible for generating and
verifying authentication codes unless a Send Email Hook deliberately replaces
that boundary.

SCIM can provision access before first login. The pending `organisation_users`
record therefore stores the provider tenant and external subject and has a
nullable user ID. On the first successful institutional login, Hektor links the
provisioned membership to the authenticated user. External
identifiers remain available for subsequent SCIM updates and audit.

Supabase owns PostgreSQL, SQL migrations, generated database types, Auth,
Storage, and Row Level Security. Vercel runs and deploys the Next.js application.
Next.js Route Handlers own HTTP concerns and call ordinary exported functions
from `@hektor/services`.

### 2. Code-based configuration model

Hektor's identity behavior is defined first in typed TypeScript configuration,
not scattered across routes, services, environment reads, and provider
dashboards. A shared `@hektor/config` package will expose focused server-safe
configuration modules:

```text
packages/config/src/
├── identity/
│   ├── google.config.ts
│   ├── microsoft.config.ts
│   └── index.ts
├── scim/
│   ├── scim.config.ts
│   └── index.ts
└── index.ts
```

Configuration objects use `as const satisfies ...` so values remain narrow
while their required shape is checked. Services and routes import these objects;
they do not reproduce provider names, claims, scopes, paths, limits, or defaults.

```ts
export const googleIdentityConfig = {
  provider: 'google',
  scopes: ['openid', 'email', 'profile'],
  callbackPath: '/auth/callback',
  audience: 'platform-administrators',
} as const satisfies GoogleIdentityConfig;
```

The code-based config is the application authority. Provider-side configuration
and infrastructure configuration are kept aligned with it through setup and
verification tooling.

Configuration still has four storage classes. Keeping them separate prevents
secrets from entering source control and prevents tenant onboarding data from
becoming deployment configuration.

| Class                        | Examples                                                                                                                     | Authority                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Versioned code configuration | Supported providers, callback paths, SCIM schemas, attribute names, role catalogue, token lifetimes                          | `@hektor/config`                                |
| Environment configuration    | Public application URL, Supabase URL and publishable key, Google OAuth client ID                                             | Environment-specific configuration              |
| Secrets                      | Google client secret, Supabase privileged credentials, SCIM token material                                                   | Local `.env` or managed deployment secret store |
| Organisation configuration   | Entra metadata URL, Supabase SSO provider ID, verified domains, Entra tenant ID, role/group mappings, SCIM credential hashes | Hektor database                                 |

The rule is: bake stable behavior and non-secret defaults into typed code;
inject environment-specific values at the application boundary; store
credentials only as secrets; store university-specific onboarding state as
managed domain data.

#### 2.1 Local Supabase configuration

`supabase/config.toml` mirrors the relevant code configuration for the local
Supabase stack. It includes the Google provider, local callback URLs, session
policy, and other Auth infrastructure settings supported by the Supabase CLI.
It does not replace `@hektor/config` as the application authority. The Google
client secret is referenced through an environment variable and is never
committed. Supabase's
[Google login guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
defines the local provider configuration and callback URL.

The client ID is not confidential. It may be versioned when one stable local
OAuth client is used, but an environment value is preferable if development,
preview, and production use separate Google Cloud projects.

Hosted Supabase Auth settings are not assumed to be deployed by database
migrations. Hektor will have a documented reconciliation step, using a supported
Supabase configuration mechanism, so preview and production provider settings
can be reproduced rather than configured from memory in the dashboard.

#### 2.2 Google platform-administrator configuration

The Google code configuration defines:

- Supabase provider identifier;
- application callback path;
- permitted post-login destinations;
- required identity claims;
- platform-administrator audience and authorisation mode;
- Google consent-screen branding and verified domains;
- the minimum scopes `openid`, `email`, and `profile`.

The OAuth client ID, client secret, public origin, and resulting absolute
callback URLs are environment values resolved and validated by the web
application. They are not duplicated as string literals throughout the code.

No Google API access is required for login, so Hektor will not request offline
access, a Google refresh token, or additional scopes. Platform-administrator
authorisation lives in Hektor's database, not in an environment-variable email
list and not in a Google profile claim.

#### 2.3 Microsoft SAML configuration

Supabase Auth is Hektor's SAML service provider. The Microsoft code
configuration defines supported NameID formats, required claims, attribute
mappings, login discovery behavior, session defaults, onboarding requirements,
and stable application paths. Supabase supports multiple SAML connections and gives
each one an `sso_provider_id`; Hektor records that ID against exactly one
organisation. See the [Supabase project SAML documentation](https://supabase.com/docs/guides/auth/enterprise-sso/auth-sso-saml).

Each university supplies its own Entra tenant information and IdP metadata.
Those values cannot be baked into global deployment config because they are
created and rotated throughout the product's lifetime. They are organisation
configuration managed through an onboarding workflow and audited database
records.

The typed configuration will define the supported SAML attribute contract, including
stable subject identifier, email, display name, given name, family name, and
optional diagnostic attributes. Institutional roles and scopes remain SCIM
entitlements rather than trusted free-form SAML claims.

#### 2.4 SCIM configuration

The SCIM protocol implementation is driven by typed code configuration:

- base path `/api/scim/v2/{organisationId}`;
- supported resource types and schemas;
- filter, pagination, and PATCH behavior;
- accepted attribute mappings;
- maximum page size and request size;
- token format, expiry, rotation, and rate-limit policy;
- standard error serialization.

Each organisation receives separate SCIM credentials. Only a keyed hash and
safe token metadata are stored in PostgreSQL; the plaintext token is shown once.
Credential creation, rotation, revocation, and use are audited. Microsoft Entra
uses the organisation-specific base URL and secret token when configuring its
provisioning connection. Microsoft's [SCIM endpoint guidance](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/use-scim-to-provision-users-and-groups)
describes this connection model.

### 3. Application module boundaries

```text
@hektor/types/domain
        ↓
@hektor/types/contracts (TypeScript contracts and Zod runtime schemas)
        ↓
@hektor/services (queries, mappers, validators, services, tasks)
        ↓
Next.js Route Handlers (HTTP, authentication, contract parsing)
        ↓
typed API consumers
        ↓
TanStack Query hooks and SSR hydration
        ↓
@hektor/ui pages and the thin web application
```

Supabase query definitions derive exact persistence result types with
`QueryData<typeof query>`. Mappers accept those result types and return domain
entities. Database rows and generated database types do not cross the service
boundary into contracts or UI props.

Service domains use only the files they need:

```text
packages/services/src/organisations/
├── organisations.queries.ts
├── organisations.mappers.ts
├── organisations.validators.ts
├── organisations.service.ts
├── organisations.service.test.ts
└── index.ts
```

Services export ordinary named functions. No dependency-injection container is
introduced.

### 4. Microsoft Entra SAML SSO

To be specified: onboarding, SP- and IdP-initiated login, domain discovery,
claims, account matching, certificate rotation, session policy, logout
limitations, auditing, and failure states.

### 5. SCIM 2.0 provisioning

To be specified: authentication, discovery endpoints, Users, Groups, filters,
pagination, PATCH operations, idempotency, deprovisioning, resynchronisation,
errors, rate limiting, and audit behavior.

### 6. Google platform-administrator login

Hektor uses Supabase's Google provider and the server-side PKCE callback flow.
Only the standard `openid`, `email`, and `profile` scopes are requested. Google
authenticates the person; Hektor's platform-admin authorisation decides whether
the authenticated user can enter the administration area.

One Google Cloud project may contain separate OAuth web clients for local,
preview, and production environments. Separate clients are preferred because
they isolate secrets and redirect allow-lists while sharing consent-screen
branding. A single client with every exact redirect URI is also technically
valid.

Local configuration requires:

- the local web origin, normally `http://localhost:3000`;
- the local Supabase Auth callback reported by the CLI, normally
  `http://127.0.0.1:54321/auth/v1/callback`;
- `/auth/callback` in the Supabase application redirect allow-list;
- local client ID and secret environment values referenced by
  `supabase/config.toml`.

Hosted configuration requires:

- the deployed Hektor origin;
- the hosted Supabase callback
  `https://<project-ref>.supabase.co/auth/v1/callback`, or the equivalent custom
  Auth domain;
- the deployed `/auth/callback` URL in Supabase's redirect allow-list;
- the environment's Google client ID and secret configured in hosted Supabase
  Auth.

Google requires the OAuth redirect URI to match an authorised URI exactly. See
the [Google OpenID Connect reference](https://developers.google.com/identity/openid-connect/reference)
and [Supabase Google login guide](https://supabase.com/docs/guides/auth/social-login/auth-google).

To be specified further: administrator assignment, bootstrap, revocation,
recovery, session policy, and audit behavior.

The initial platform administrator is bootstrapped through the server-only
`HEKTOR_ADMIN_EMAILS` environment value. After successful Google login, Hektor
uses the Supabase Admin API to place the `admin` role in server-controlled
`app_metadata`. The environment value is never exposed to the browser. An
administrative role-management workflow can replace or supplement this bootstrap
mechanism later.

### 7. Roles and permissions

Each user has one effective role in the relevant scope:

- `admin`: Hektor platform administrator; not assigned by a university;
- `org_admin`: university administration and configuration;
- `tutor`: configures and delivers learning;
- `learner`: undertakes learning.

`admin` is platform-wide. The remaining roles live on `organisation_users`.
The initial model does not introduce multiple role assignments. Permissions are
defined in code configuration rather than repeated as route-local conditionals.

A user may have `organisation_users` records in more than one organisation,
with one role in each. Personal access remains independent of those memberships.
The application therefore exposes an active-context selector for personal use
and every active organisation membership. Context selection does not replace
server-side membership and role checks.

To be specified further: the exact permission matrix and whether an `admin`
acting inside a test organisation also needs an `organisation_users` record.

### 8. Organisation-management schema

#### 8.1 Users, memberships, and provisions

Hektor access is granted only by a canonical organisation membership:

```text
effective access =
  organisation.status == active
  AND organisation_user.status == active
```

The relevant lifecycle enums are:

```text
OrganisationStatus: active | suspended | archived
OrganisationUserStatus: active | suspended
ProvisioningMethod: scim | csv | manual
ProvisioningStatus: pending | linked | inactive | revoked | failed
```

`organisation_users` is a durable link between an organisation and a canonical
Hektor user. It contains organisation context such as role, cohort, and
membership status, but no copied name, email, or provisioning state.

`organisation_user_provisions` contains identities asserted through SCIM, CSV,
or manual provisioning. A provision may later link to an organisation user, but
its asserted profile fields never replace canonical user details. Pending and
revoked provisions cannot grant access. Unprovisioning suspends the relevant
membership without deleting the user's personal account.

A provision follows an explicit lifecycle. Pending provisions may link or fail;
failed provisions may be retried; linked provisions may become inactive; and an
inactive provision may reactivate the same durable membership. Revocation is
terminal for that assertion. A later SCIM enablement creates a new provision
which may link back to the existing membership. Once linked, a provision cannot
fail, and at most one non-revoked provision controls a membership at a time.

Automatic linking uses a normalized, verified canonical email. If that user
already has an organisation membership with the asserted role, the provision
links to it immediately. A verified user without a membership must accept the
prepared relationship before it is linked; an unresolved identity remains
pending.

#### 8.2 Cohorts and groups

Users see one organisation group concept regardless of how a group was created.
Provisioning provenance determines who controls it.

```text
organisation_cohorts
organisation_groups                         group may belong to a cohort
organisation_group_users                    canonical user membership
organisation_provisioned_group_users        unresolved provision membership
```

An organisation group has an optional provisioning method and external source
identifier. A group without provisioning metadata is locally managed. A
SCIM-managed group remains the same domain entity but is normally read-only in
Hektor and synchronized from its authoritative source.

A cohort represents the complete undergraduate programme intake, normally
three years for undergraduate nursing. A learner has at most one cohort within
an organisation and may belong to several teaching or study groups. Groups may
exist without a cohort.

Group membership for an unresolved provision is kept separately from canonical
organisation group membership. It is materialized as an
`organisation_group_users` record when account linking succeeds.

#### 8.3 Seats

An active learner membership consumes an organisation seat regardless of
whether it was added manually or established through SCIM, CSV, or another
provisioning flow. `org_admin`, `tutor`, and platform `admin` users do not
consume learner seats.

Seat usage is measured within a contract period, so it is kept separate from the
organisation-user lifecycle:

```text
organisation_contract_periods
├── organisation_id
├── starts_at
├── ends_at
└── learner_seat_allowance

organisation_seat_activations
├── organisation_contract_period_id
├── organisation_user_id
├── activated_at
└── released_at
```

There is at most one activation for an organisation user in a contract period.
Activating or linking a learner idempotently acquires the current contract
period's seat. Suspending the durable membership releases it while retaining the
activation record for audit; reactivation must reacquire capacity. If capacity
is exhausted, linking or reactivation fails atomically and leaves the provision
in its prior state.

To be specified further: all columns, constraints, domains, SSO connections,
SCIM credentials, provisioning events, and audit events.

### 9. Tenant isolation and RLS

To be specified: policies, grants, privileged operations, service-role boundary,
active-organisation-user checks, indexes, and cross-tenant regression tests.

### 10. API and query contracts

To be specified: routes, request/response contracts, error envelope,
collections, API consumers, query keys, mutations, invalidation, and SSR
hydration.

### 11. Organisation-management views

To be specified: platform organisation list/detail/onboarding views and
institution settings, people, groups, role mappings, SSO, SCIM, provisioning
activity, audit, empty, loading, error, and permission-denied states.

### 12. Security, auditing, and operations

To be specified: credential handling, event retention, PII minimisation,
observability, alerting, provider outage handling, and operational runbooks.

### 13. Documentation application

Hektor documentation is a first-class workspace application at `apps/docs`,
built with Astro and Starlight. Starlight content lives under
`apps/docs/src/content/docs`. The application is independently buildable and
deployable while participating in the root Yarn and Turborepo checks.

Documentation is delivered in the same change as each integration capability.
The Microsoft and SCIM work must include:

- university administrator setup guides;
- Hektor operator onboarding and rotation procedures;
- attribute and group-mapping references;
- local and hosted test instructions;
- expected lifecycle behavior;
- troubleshooting and audit guidance.

Repository-internal design records may remain under root `docs` while they are
drafts. Reviewed operator and customer guidance moves into Starlight rather than
being duplicated. Starlight's standard project structure and Markdown/MDX
content model are documented in its [getting-started guide](https://starlight.astro.build/getting-started/).

## Implementation plan

The detailed implementation plan will be written after the technical design is
reviewed. It will order schema, types, services, API routes, clients, hooks,
views, Microsoft SSO, SCIM, integration tests, rollout, and operations by their
actual dependencies.
