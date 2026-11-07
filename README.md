# Fieldwork Operations

Fieldwork Operations helps OJT interns record attendance and completed work, and gives department advisers the records they need to review progress toward required training hours.

[Open the demo](https://fieldwork-operations.srecosystem.space/login?workspace=demo)

## What you can do

- **Record a shift:** capture Time in, Break out, Break in, and Time out with a photo and location.
- **Prepare time records:** select dates and preview printable monthly DTR forms from attendance entries.
- **Review attendance:** advisers inspect captures, record outcomes, and adjust remaining training hours.
- **Report completed work:** interns keep dated accomplishments with optional photos and filter them for reports.

## Client delivery and portfolio edition

June Aurelius Jacinto developed the original client system from September to December 2025, and it was delivered on the client's local server. The client approved a public showcase without naming or visually identifying the school.

This separately hosted portfolio edition uses generalized branding and includes later interface, authentication, architecture, and release improvements. Those changes are not claims about the original client handoff.

The demo lets visitors choose a fictional intern, adviser, or administrator without a password. It uses a separate Firebase project, sample photos and coordinates, and visitor-specific changes. The **Demo** menu in the navigation contains details, account switching, and exit. Registration, profile changes, passwords, and shift-setting changes are disabled. See [DEMO.md](DEMO.md) for setup and data handling.

## Engineering context

The app uses React, TypeScript, Vite, Firebase Authentication, and Firestore. Route files are flat under `website/src/pages`; page-specific behavior lives in `features/<Name>Page`, with common clients, hooks, models, and components in `shared`. Server data flows through TanStack Query and the existing private `@saintrelion/*` packages.

Firestore rules enforce data access. Attendance review and remaining-hour updates are separate browser writes, so a partial failure can leave them inconsistent. First-admin provisioning is manual; deleting an application profile does not delete its Firebase Auth account.

Page navigation fetches current HTML from the network, with cached HTML as an offline fallback. Hashed assets remain cached. There is no periodic release polling or forced reload of open tabs. Offline page support does not make Firebase writes available offline.

## Local setup

Use Node.js 22, pnpm/Corepack, and authorized access to the private packages:

```powershell
cd website
corepack enable
pnpm install
pnpm dev
```

The development command serves port **5174**. Open `/login?workspace=demo` to use the hosted demo; no Firebase emulators or Java runtime are required. Normal sign-in uses the live project's public Web App settings in `website/.env`. Initialization lives in `website/src/shared/lib/firebase-client.ts`; demo settings are in `website/src/shared/config/demo.ts`.

Before working with real records, configure your own Firebase project and deploy the appropriate [live Firestore rules](firestore.rules). Demo rules are separate. Run `pnpm build` and `pnpm lint` from `website` to check changes.

GitHub Actions publishes the website image and rolls production forward on application changes pushed to `main`. Markdown-only changes are excluded; `[skip build]` also skips image publication and deployment. CI does not run frontend tests or lint, or deploy Firestore rules. See [GITHUB_SETUP.md](GITHUB_SETUP.md) for package access, provisioning, and release operations. A plain `docker compose up` does not start the website; the image-build check uses the opt-in `image` profile.

## Author

**June Aurelius Jacinto** · Full-Stack Software Developer · [GitHub](https://github.com/SaintRelion)

<details>
<summary>SREcosystem project metadata</summary>

<!-- project:manifest:start -->
```json
{
  "schema_version": 2,
  "title": "Fieldwork Operations",
  "slug": "fieldwork-operations",
  "summary": "An OJT attendance and reporting system where interns record shifts and accomplishments, and department advisers review attendance and track required training hours.",
  "description": "Interns record four daily attendance steps, review their training hours, and prepare time records and accomplishment reports. Advisers review records for their department, while administrators manage advisers and intern access. The original client system was delivered in 2025; this separately hosted portfolio edition includes later improvements and a fictional demo.",
  "role": "Full-stack developer",
  "contribution": "Developed the original client system and reengineered the portfolio edition, including the interface, Firebase Authentication, attendance workflow fixes, page-scoped architecture, and isolated public demo.",
  "engineering_notes": [
    {
      "key": "lan-to-firebase",
      "title": "Changing deployment assumptions",
      "body": "The project moved from local-LAN plans toward Firebase. The portfolio edition replaces the earlier custom credential flow with Firebase Authentication for credentials and sessions, while Firestore stores application profiles. These later changes are separate from the original client delivery."
    },
    {
      "key": "attendance-review-updates",
      "title": "Attendance review remains client-coordinated",
      "body": "Adviser decisions update attendance outcomes and remaining training hours through separate browser operations. A partial failure can leave those records inconsistent. Transactional or server-owned updates remain a next step; the current workflow does not provide an atomic review operation."
    },
    {
      "key": "private-data-access-package",
      "title": "Private package dependency",
      "body": "The frontend uses private SaintRelion data-access and UI packages. Fresh installs and image builds require authorized package access. Shared data access uses TanStack Query; page-specific components and behavior live beside their matching feature, with flat route files composing each page."
    },
    {
      "key": "isolated-demo-workspace",
      "title": "Separate demo data and visitor changes",
      "body": "The public demo uses a separate Firebase project and anonymous visitor identities. Fictional profiles select the displayed role and department; they are not privileged authentication accounts. Shared sample records remain read-only, while each visitor writes private copies. Camera and location capture use sample values."
    },
    {
      "key": "release-cache-policy",
      "title": "Fresh pages with an offline fallback",
      "body": "The service worker fetches page HTML from the network and uses saved HTML when the network is unavailable. Hashed build assets stay cached. HTML and worker scripts use no-store headers, and the app does not poll for releases or force open tabs to reload."
    }
  ],
  "confidentiality_message": "The client approved a portfolio showcase provided the school was not named or visually identifiable. Branding and demonstration records are generalized; the client installation and its URL are not published here.",
  "lifecycle": "completed",
  "started_on": "2025-09",
  "ended_on": "2025-12",
  "featured": false,
  "types": [
    "website"
  ],
  "technologies": [
    "react",
    "typescript",
    "docker",
    "kubernetes",
    "nginx"
  ],
  "links": [
    {
      "kind": "demo",
      "label": "Open portfolio demo",
      "url": "https://fieldwork-operations.srecosystem.space"
    }
  ],
  "media": [],
  "features": [
    {
      "key": "shift-capture",
      "title": "Record a four-step shift",
      "description": "Interns record Time in, Break out, Break in, and Time out with a photo and location, building a dated attendance sequence for review.",
      "outcome": "",
      "interaction": "walkthrough"
    },
    {
      "key": "daily-time-record",
      "title": "Prepare a daily time record",
      "description": "Interns select a date range and preview printable monthly DTR forms from recorded attendance, with missing times left blank.",
      "outcome": "Recorded weekend shifts are included.",
      "interaction": "walkthrough"
    },
    {
      "key": "attendance-review",
      "title": "Review attendance and training hours",
      "description": "Department advisers inspect intern captures, record attendance outcomes, and apply the corresponding adjustments to remaining training hours.",
      "outcome": "",
      "interaction": "walkthrough"
    },
    {
      "key": "accomplishment-log",
      "title": "Keep a dated work log",
      "description": "Interns record completed work with an optional photo, then filter dated entries for an accomplishment report.",
      "outcome": "",
      "interaction": "walkthrough"
    }
  ]
}
```
<!-- project:manifest:end -->

</details>
