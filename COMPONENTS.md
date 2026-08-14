# Hektor component architecture

This document defines the component model for `@hektor/ui`, the shared Tailwind
theme in `@hektor/tailwind-config`, and the boundary between the UI library and
application code.

Hektor uses atomic design as an organizational and dependency model. Components
progress from generic primitives to complete page compositions without acquiring
data-fetching, routing, or application-state responsibilities.

## Decisions

- Hektor's component library targets the web only. A future React Native product
  will use a separate component library rather than adding cross-platform
  constraints to `@hektor/ui`.
- Tailwind CSS 4 provides styling through a CSS-first shared theme package.
- Atoms are owned source code based on shadcn patterns and Base UI primitives.
  shadcn is a source generator and reference, not a runtime component-library
  abstraction that application code imports from.
- Every visible component at every atomic level has Storybook stories.
- UI-library components receive data and behavior through props. Application
  routes and providers own fetching, URL state, and application state.

## Package layout

```text
packages/
├── tailwind-config/
│   ├── package.json
│   └── src/
│       └── theme.css
└── ui/
    ├── .storybook/
    ├── package.json
    ├── src/
    │   ├── styles.css
    │   ├── context/
    │   ├── atoms/
    │   ├── molecules/
    │   ├── organisms/
    │   ├── templates/
    │   └── pages/
    └── tsconfig.json
```

`@hektor/tailwind-config` owns shared design tokens and Tailwind theme mappings.
`@hektor/ui` imports that theme and owns all reusable visual components. Apps
consume both packages but do not become implementation dependencies of either.

## Shared UI context

Cross-cutting client-side presentation state lives under `src/context`, outside
the atomic layer hierarchy. Context providers must remain independent of app
routers, data clients, and domain state. They expose focused hooks and are
exported through the `@hektor/ui/context` entrypoint.

`ThemeProvider` owns the `light`, `dark`, and `system` theme preference. It
persists the preference in local storage, follows operating-system changes while
set to `system`, and applies the resolved theme to the document root. Components
consume this through `useTheme`; they must not implement separate theme storage
or media-query state.

The same provider owns durable interface preferences that belong across routes.
The application-menu state is stored locally and restored through `menuState`
and `setMenuState`. Templates use that preference by default while retaining a
controlled API for exceptional consumers and isolated stories.

Theme selection UI belongs in the atomic hierarchy. `ThemeSwitcher` is a
molecule because it composes generic buttons into one focused preference
control. Icons use the Lucide set exported by `react-icons/lu`.

## Shared Tailwind theme

Tailwind 4 is CSS-first, so `@hektor/tailwind-config` exports CSS rather than a
legacy JavaScript `tailwind.config` preset. Consumers import the package from
their global stylesheet:

```css
@import '@hektor/tailwind-config';
@import '@hektor/ui/styles.css';
```

The theme package declares semantic CSS custom properties and maps them into
Tailwind with `@theme` or `@theme inline`. It provides usable defaults, including
light and dark values, while allowing an application or branded surface to
override the custom properties without rebuilding the component library.

Components use semantic utilities such as background, surface, foreground,
muted, accent, destructive, border, and focus-ring tokens. They must not couple
themselves to raw palette values when a semantic token exists.

The theme package contains no React code, component styles, product branding, or
application-specific layout rules.

## Atomic layers

Dependencies flow in one direction:

```text
pages -> templates -> organisms -> molecules -> atoms
```

A layer may use components from any layer to its right. It must not import from
a layer to its left. Avoid same-layer composition when moving the composition up
one level expresses the design more clearly.

### Atoms

Atoms are the smallest reusable interface primitives: buttons, inputs, labels,
icons, badges, separators, tooltips, and similar controls.

- Atoms are generic and contain no Hektor domain language.
- Use shadcn patterns and Base UI where accessible interaction behavior is
  required.
- Generated code is reviewed and becomes Hektor-owned source under `atoms`; do
  not wrap generated components merely to hide their origin.
- Prefer controlled APIs. Internal state is acceptable when it implements local
  interaction or accessibility behavior rather than application state.
- Atoms may depend on small styling utilities such as class merging and variant
  construction, but never on another atomic layer.

### Molecules

Molecules combine atoms and focused custom markup into small, increasingly
specialized interface concepts: form fields, search controls, labelled values,
filter controls, or compact status summaries.

- Molecules are stateless with respect to business and application state.
- Props in and rendered UI or callbacks out is the default contract.
- They may contain local interaction state only when it is entirely internal and
  does not select, cache, or mutate application data.
- They may use atoms and platform-neutral helper code.
- They do not fetch, read route state, or import application providers.

### Organisms

Organisms are feature-scale, specialist compositions such as an account header,
navigation system, conversation panel, or profile editor.

- Organisms may understand Hektor domain concepts.
- They compose molecules and atoms and may use focused custom code.
- They remain presentation components: resolved data and event handlers arrive
  through props.
- Prefer controlled state for feature behavior so organisms remain usable in
  Storybook, tests, alternate routes, and future applications.
- They never import from an app, perform data fetching, or own URL state.

### Templates

Templates define content-agnostic, full-page structures. They establish regions,
responsive layout, and slots without supplying page content.

- Templates expose slots such as header, navigation, sidebar, main, footer, and
  actions through props or children.
- They may include organisms for stable site furniture such as navigation,
  headers, and footers when those features are part of the template contract.
- Template stories use representative placeholder content to demonstrate layout;
  placeholder copy is not a template default.
- Templates contain no fetching, routing, or product-page decisions.

### Pages

UI-library pages are complete page compositions. They configure templates and
organisms with concrete content but remain independent of the Next.js router.

- Pages may contain realistic product copy, resolved view models, and named user
  states such as loading, empty, error, and populated.
- Pages accept all data and actions through props.
- Pages do not call API hooks, read URL parameters, perform redirects, or import
  files from `apps/web`.
- A page name describes a user-facing screen, for example `AccountSettingsPage`,
  and is distinct from a Next.js `page.tsx` route module.

Next.js route files own fetching, route state, authentication decisions, and
navigation. They convert those concerns into a resolved prop contract and render
the corresponding `@hektor/ui` page.

## Component file shape

Each component uses a PascalCase directory matching its public export:

```text
src/<layer>/<ComponentName>/
├── <ComponentName>.component.tsx
├── <ComponentName>.stories.tsx
├── <ComponentName>.test.tsx       # when behavior warrants it
└── index.ts
```

- Component directories and exported React components use PascalCase.
- Tests are colocated. Use `.test.tsx` for JSX and `.test.ts` otherwise.
- The component's `index.ts` exposes its supported public API.
- Each layer has an `index.ts`; the package root exposes deliberate public
  entrypoints rather than internal file paths.
- Prefer named exports.
- Keep component-specific types beside the component. Promote a type only when
  it is genuinely shared.

Consumers import from public package entrypoints, for example:

```tsx
import { Button } from '@hektor/ui/atoms';
import { SearchField } from '@hektor/ui/molecules';
import { AccountSettingsPage } from '@hektor/ui/pages';
```

Do not import `@hektor/ui/src/...` or reach into another component directory.

## Storybook

Storybook lives in `packages/ui` and is the development and review surface for
the entire design system.

Every component with visible UI has a colocated story. Story titles are grouped
by atomic layer so Storybook navigation can collapse areas that are no longer the
focus:

```tsx
const meta = {
  title: 'Atoms/Button',
  component: Button,
};
```

Use exactly these top-level groups:

- `Atoms`
- `Molecules`
- `Organisms`
- `Templates`
- `Pages`

Stories are the supported-state contract. Cover all relevant variant axes and
user-visible states, including default, loading, empty, error, disabled, and
interactive states where applicable. Templates and pages must demonstrate their
important responsive arrangements and state compositions.

Global Storybook controls provide light and dark themes. Individual stories do
not implement their own theme switchers. Viewport presets should make mobile and
desktop review straightforward.

Pure non-visual utilities do not need stories. A component should not be placed
in an atomic layer merely to make a non-visual utility appear in Storybook.

## State, data, and framework boundaries

Components in `@hektor/ui` must not:

- perform server-side fetching;
- call application query or mutation hooks;
- read route parameters, search parameters, cookies, or request headers;
- import `server-only` modules;
- import application contexts that carry fetched data;
- depend on Supabase, Next.js route modules, or files under `apps/`.

Routes or application providers resolve data and pass it down:

```tsx
const account = await loadAccount();

return <AccountSettingsPage account={account} onSave={saveAccount} />;
```

The UI library may define serializable view-model types close to the component
that consumes them. Domain entities and database row types should be adapted at
the application boundary rather than becoming the component API by default.

## Server and client components

Components are server-compatible by default. Add `'use client'` only when a
component needs event handlers, effects, browser APIs, or interactive primitive
behavior.

Interactive atoms based on Base UI will often be client components. Keep that
boundary as low in the atomic tree as practical. Avoid passing component
functions across a server-to-client boundary; use renderable children or data
descriptions instead.

## Accessibility and styling expectations

- Start with semantic HTML and accessible headless behavior.
- Keyboard operation, focus visibility, labelling, and reduced-motion behavior
  are part of the component contract.
- Support light and dark themes through shared semantic tokens.
- Expose `className` only where consumers have a legitimate composition need;
  stable variants are preferable to repeated one-off overrides.
- Responsive behavior belongs to the lowest layer that owns the relevant layout.
- Avoid application-specific spacing or width assumptions in atoms and molecules.

## Choosing a layer

Choose the lowest layer that accurately describes the component:

1. Is it an indivisible, domain-free control or visual primitive? Use an atom.
2. Is it a small stateless concept made from primitives? Use a molecule.
3. Is it a specialist, feature-scale composition? Use an organism.
4. Does it define content-free regions for a whole screen? Use a template.
5. Does it configure a whole screen with concrete content and states? Use a page.

If a component starts fetching, reading the router, or importing application
state, move that responsibility to the consuming app rather than moving the
component to a higher atomic layer.

## Initial implementation boundary

The first implementation phase creates the two packages, theme entrypoints,
atomic directories, public exports, Storybook configuration, and verification
scripts. It does not add speculative design-system components. Atoms and higher
layers are introduced in response to concrete product needs and reviewed through
Storybook as they arrive.
