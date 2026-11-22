---
applyTo: 'packages/types/src/**/*.ts,packages/services/src/**/*.ts,apps/web/app/api/**/*.ts,supabase/migrations/**/*.sql'
---

# Domain and boundary review

- Keep canonical domain types in TypeScript and derive boundary schemas from
  them; use existing enums. Check that runtime validation and TypeScript agree,
  including optional fields, unions and states permitted by each representation.
- Trace relationships through aggregates: ownership, allowed scenarios, learner
  participation and clinical documents must agree. Check foreign keys, uniqueness
  and transaction boundaries when persistence is part of the change.
- Check identity and permissions against server-resolved context, not trusted
  request IDs. Tutor read access must not implicitly permit learner writes.
- Look for lost updates, non-atomic multi-record saves and mutable source content
  altering existing learner work. Require concurrency or snapshot handling only
  where the implemented operation needs it; identify deferred persistence clearly.
- Prefer one authoritative rule/document over copies that can diverge. Keep
  boundary validation, domain decisions and database mapping in their established
  layers rather than building a universal helper that owns all three.
- Inspect negative tests for independently constructed invalid states: wrong
  owner, mixed learner contexts, mismatched types and conflicting revisions.
  Do not treat passing happy-path tests as evidence that these cases are covered.

Apply the repository traffic lights and source-comment guidance. Explain a
specific failure or maintenance cost before recommending a new abstraction.
