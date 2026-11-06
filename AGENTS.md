# Fieldwork Operations engineering instructions

## Architecture

Use the engineering-delivery skill and its React architecture profile at C:/Users/Codeculus/.codex/skills/engineering-delivery/references/react-django.md. This project uses React/Vite and Firebase; the Django guidance does not apply. Keep the existing dependency stack.

The user selected this page-scoped adaptation of FSD, based on SREcosystem Hub:

- Route files live directly in website/src/pages/ and are named <Name>Page.tsx. Pages compose the UI and import behavior from their matching feature.
- Page-specific code belongs in website/src/features/<Name>Page/: components/ for UI, hooks/ for React behavior and queries, lib/ for pure helpers and constants, and model/ for feature types or client state. Create folders only when they contain code.
- Use a feature-local firebase.ts for direct Firestore calls owned by that feature. Do not add API wrappers around calls already handled by the shared useResourceLocked hook.
- Common code belongs in website/src/shared/: components/, hooks/, lib/, config/, auth/, and model/. Shared modules must not import pages, features, or app code. Types genuinely used by several pages remain in shared/model/.
- Application bootstrap, router, layouts, shell components, and styles belong in website/src/app/. Keep src/main.tsx as the entry point.
- Features must not import route modules, application composition, or another page's feature. Move a dependency to shared when multiple features need it. Do not add an entities layer or barrel exports mechanically.
- The private forms/UI packages still import @/lib/utils and @/components/ui/dialog. Keep the exact compatibility aliases in vite.config.ts until those packages change; application source must use the shared paths.
- Keep server data in TanStack Query through the existing data-access boundary. Preserve both normal Firebase behavior and visitor-isolated demo behavior.

## Comments

Use a 60-character equals-sign separator followed by MARK: Section name. JSX uses two separate JSX comments; TypeScript uses two // comments. Preserve useful explanations below the section label.

## Delivery

Preserve existing local work and use the git-workflow skill for delivery. Main-branch pushes publish the website image and invoke the production rollout; do not merge, push main, or deploy without user direction. Firebase demo rules are separate from production rules. Do not change hosted data for an architecture refactor.

## Release caching

Fetch page HTML from the network on document navigation, with cached HTML only as an offline fallback. Cache hashed build assets immutably. Do not add periodic update polling or automatically reload open tabs. Keep the legacy /sw-update.js URL as an inert compatibility file while older deployed workers may import it.
