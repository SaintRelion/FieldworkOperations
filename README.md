# Fieldwork Operations

Fieldwork Operations tracks OJT attendance, required hours, and accomplishments for interns, department advisers, and administrators. June Aurelius Jacinto developed the client system and this reengineered portfolio edition.

## Portfolio edition and demo

**Client project · Reengineered portfolio edition.** The client approved a public showcase without naming or visually identifying the school. The original system was delivered on its locally deployed server after development from September to December 2025. This separately hosted edition uses generalized branding and fictional demo records; later improvements are not claims about the client handoff.

[Open portfolio demo](https://fieldwork-operations.srecosystem.space) · Availability has not been independently verified. The previews below work offline.

## Selected workflows

These previews illustrate the workflows with fictional records. They do not connect to Firebase or save changes.

<!-- portfolio:showcase:start -->

<!-- portfolio:feature shift-capture -->
## Record a four-step shift

Interns capture a photo and location at Time in, Break out, Break in, and Time out. The preview simulates camera feedback without accessing the device.

<!-- portfolio:preview showcase_html/shift-capture.html -->

<!-- portfolio:feature daily-time-record -->
## Build a daily time record

Interns select a date range to preview monthly DTR forms filled from recorded attendance. Missing entries stay blank; the preview does not print an official record.

<!-- portfolio:preview showcase_html/daily-time-record.html -->

<!-- portfolio:feature attendance-review -->
## Review attendance outcomes

Advisers inspect captured entries, confirm an outcome, and track the corresponding remaining-hour adjustment. The preview uses fictional records and makes no database changes.

<!-- portfolio:preview showcase_html/attendance-review.html -->

<!-- portfolio:feature accomplishment-log -->
## Keep a dated work log

Interns log dated work with an optional photo and filter entries for an accomplishment report. The preview demonstrates entry validation without saving or generating an official report.

<!-- portfolio:preview showcase_html/accomplishment-log.html -->

<!-- portfolio:showcase:end -->

## Implementation and limitations

This edition is a React/Vite frontend using Firebase Authentication and Firestore through the private `@saintrelion/*` data-access package. The shift from local-LAN plans to Firebase led to an earlier custom credential flow; the portfolio edition now uses Firebase Authentication and keeps application profiles in `ojt_User/{uid}`. The manifest below records the engineering context in more detail.

Firestore Security Rules, not route guards, control data access. Attendance outcomes and remaining-hour changes are currently separate browser-driven updates, not an atomic transaction. The first administrator needs manual Firebase provisioning, and deleting a profile does not delete its Auth account.

GitHub Actions checks build inputs, publishes a commit-SHA website image, and invokes a production Kubernetes rollout. It does not run frontend tests or lint, deploy Firestore rules, or provide staging. There is no application API or database migration job in this repository. See [GITHUB_SETUP.md](GITHUB_SETUP.md) for operational details; private server manifests are not published here.

## Getting started

You need Node.js 22, pnpm/Corepack, a Firebase project, and authorized access to the private `@saintrelion/*` packages. The committed `website/.env` contains public Firebase Web App settings only; choose a separate Firebase project before testing against anything sensitive. From `website/`:

```powershell
corepack enable
pnpm install
pnpm dev
```

Vite is configured for port 5174. Deploy and test [Firestore Security Rules](firestore.rules) before using real records; the frontend alone does not enforce data access. First-admin provisioning, package access, release configuration, and image-build instructions are in [GITHUB_SETUP.md](GITHUB_SETUP.md). A plain `docker compose up` does not start the website; the image-build test uses the opt-in `image` profile.

## Author

**June Aurelius Jacinto** · Full-Stack Software Developer · [GitHub](https://github.com/SaintRelion)

## Portfolio manifest

<!-- portfolio:manifest:start -->
```json
{
  "schema_version": 2,
  "title": "Fieldwork Operations",
  "slug": "fieldwork-operations",
  "summary": "An OJT system for four-step attendance, adviser review, training progress, and accomplishment records.",
  "description": "A role-based internship operations system for interns, department advisers, and administrators. The school received a version deployed on its own local server. This separately hosted portfolio edition uses generalized branding and includes later interface, authentication, and release-workflow changes; those changes should not be read as part of the client handoff.",
  "role": "Full-stack developer",
  "contribution": "Developed the client's OJT system and reengineered this portfolio edition, including its interface, Firebase Authentication integration, attendance workflow fixes, and website image release workflow.",
  "engineering_notes": [
    {
      "key": "lan-to-firebase",
      "title": "Changing deployment assumptions",
      "body": "The original direction was local LAN use, but requirements moved toward Firebase. A quickly patched custom credential flow kept the core workflows moving at the time; the portfolio edition replaces it with Firebase Authentication for credentials and sessions, while Firestore retains application profiles."
    },
    {
      "key": "attendance-review-updates",
      "title": "Attendance review remains client-coordinated",
      "body": "Adviser decisions update attendance outcomes and an intern's remaining hours through separate browser-driven operations. This supports the current review workflow but is not an atomic transaction; transactional or server-owned updates are a meaningful next step before higher-stakes use."
    },
    {
      "key": "private-data-access-package",
      "title": "Private package dependency",
      "body": "The app still uses private SaintRelion data-access and UI packages. They reduce duplicated app code but require authorized package access for a fresh install or image build. The data-access layer retains provider abstractions, although this app currently selects Firebase."
    }
  ],
  "confidentiality_message": "The client approved a portfolio showcase provided the school was not named or visually identifiable. Branding and demonstration records are generalized; the client installation and its URL are not published here.",
  "lifecycle": "completed",
  "started_on": "",
  "ended_on": "",
  "featured": false,
  "types": ["website"],
  "technologies": ["react", "typescript", "docker", "kubernetes", "nginx"],
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
      "description": "Interns record Time in, Break out, Break in, and Time out with a photo and coordinates; the interface shows the next step and camera-access feedback.",
      "outcome": "Gives interns and advisers a dated sequence of attendance captures to review.",
      "interaction": "walkthrough",
      "preview_path": "showcase_html/shift-capture.html"
    },
    {
      "key": "daily-time-record",
      "title": "Build a daily time record",
      "description": "A selected date range produces monthly DTR forms from recorded attendance entries, leaving missing times blank and including recorded weekend shifts.",
      "outcome": "Lets interns preview and print a two-copy daily time record from existing captures.",
      "interaction": "walkthrough",
      "preview_path": "showcase_html/daily-time-record.html"
    },
    {
      "key": "attendance-review",
      "title": "Review attendance outcomes",
      "description": "Department advisers inspect dated captures, confirm attendance outcomes, and apply the corresponding hour adjustments for assigned interns.",
      "outcome": "Helps advisers track reviewed attendance and remaining required hours.",
      "interaction": "walkthrough",
      "preview_path": "showcase_html/attendance-review.html"
    },
    {
      "key": "accomplishment-log",
      "title": "Keep a dated work log",
      "description": "Interns log dated descriptions of completed work, optionally add photos, and filter entries for an accomplishment report.",
      "outcome": "Keeps work evidence organized by date for intern reporting.",
      "interaction": "walkthrough",
      "preview_path": "showcase_html/accomplishment-log.html"
    }
  ]
}
```
<!-- portfolio:manifest:end -->
