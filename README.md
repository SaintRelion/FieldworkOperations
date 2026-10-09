# Fieldwork Operations

Fieldwork Operations helps internship programs keep daily attendance, training hours, and work evidence in one place. Interns record a four-step shift and accomplishments; department advisers review attendance and progress; administrators manage accounts and assignments. June Aurelius Jacinto was the full-stack developer for the client project and its reengineered portfolio edition.

## Portfolio edition and demo

**Client project · Reengineered portfolio edition**

The client permitted a public portfolio presentation provided the school was not named or visually recognizable. The original system covered these same core workflows and was deployed locally on the school's purchased server. This edition uses generalized Fieldwork Operations branding and fictional demonstration records. Later UI, authentication, attendance, and deployment changes in this repository describe the portfolio edition, not necessarily what the client received. No client identity or installation URL is published here.

The portfolio deployment is configured for [Open portfolio demo](https://fieldwork-operations.srecosystem.space), on the developer's infrastructure rather than the client's installation. Availability and public access have not been independently verified for this README update. The self-contained previews below work without that deployment.

## Original delivery and constraints

The client needed an OJT system for intern attendance and adviser oversight. The delivered system covered the same core attendance, intern management, accomplishment, and reporting workflows represented here, running on the school's own local server. Requirements changed during development: an initially local-LAN direction moved toward Firebase. Meeting that change led to a quickly patched authentication approach while the core workflows remained the priority. The limitation was a custom credential flow that was harder to reason about and maintain. In this portfolio edition, Firebase Authentication now owns credentials and sessions, with Firestore keeping only application profile data. This was a response to changing architecture needs, not a claim that the client was at fault or that a deadline forced the decision.

## Selected workflows

The previews use fictional records and model the interaction; they do not connect to Firebase or perform real attendance, review, or reporting actions.

<!-- portfolio:showcase:start -->

<!-- portfolio:feature shift-capture -->
## Record a four-step shift

An intern moves through Time in, Break out, Break in, and Time out in order. The application captures a photo and coordinates with each entry, shows camera-permission feedback, and displays the next available step and recent records. The preview simulates the sequence and permission feedback; it does not request camera or location access. The current client-side sequence is a UI workflow, not proof of server-enforced ordering.

<!-- portfolio:preview showcase_html/shift-capture.html -->

<!-- portfolio:feature daily-time-record -->
## Build a daily time record

An intern selects a date range and previews a monthly DTR populated from existing Time in, Break out, Break in, and Time out entries. Each month gets its own form; an unrecorded weekend is labeled, while a recorded weekend shift keeps its times. The application offers a two-copy print layout. The preview lets you change the range and inspect sample rows, but does not print or produce an official record; missing entries remain blank rather than being inferred.

<!-- portfolio:preview showcase_html/daily-time-record.html -->

<!-- portfolio:feature attendance-review -->
## Review attendance outcomes

A department adviser inspects dated captures for assigned interns and marks entry records verified, tardy, excused, or absent. Late entries are flagged against department shift settings; the chosen outcome also affects remaining hours and penalty counts. The UI asks for confirmation before applying an outcome. The preview shows the decision and resulting status using fixed fictional data, without writing to a database. The current update path is client-orchestrated, so it should not be described as an atomic payroll or compliance process.

<!-- portfolio:preview showcase_html/attendance-review.html -->

<!-- portfolio:feature accomplishment-log -->
## Keep a dated work logs

An intern adds a dated description of completed training work, optionally with a photo, then can generate a date-filtered accomplishment report from this tab. A description and date are required; the real form offers camera capture or file upload and explains when camera access fails. The preview demonstrates entry validation and report filtering with fictional content, without storing files or generating an official report.

<!-- portfolio:preview showcase_html/accomplishment-log.html -->

<!-- portfolio:showcase:end -->

## Engineering changes in this edition

The current source uses a redesigned Fieldwork Operations interface across the portal and role-specific workspaces. Firebase Authentication now owns sign-in, sessions, password changes, and account creation; `ojt_User/{uid}` retains application profile and role data rather than password hashes. The intern attendance page refreshes after a recorded step, and attendance history derives visible outcomes from reviewed records. DTR rows map existing attendance by date and step. These are verifiable properties of the current code, not claims about the original client release or completed external testing.

The repository also has a structured development and deployment workflow: a local Vite server, a Docker image build, GitHub Actions checks and image publication, and a Kubernetes rollout. This describes the implemented workflow, not a claim of production readiness.

## Decisions and tradeoffs

React, Vite, and the Firebase client SDK keep this edition browser-delivered without an application server. The shift from an initial local-LAN direction to Firebase changed the identity and data-access assumptions. Firestore holds OJT records, while Firebase Authentication holds credentials. That separation removes the earlier browser-side password-hash document flow, but profile creation still couples an Auth account with a Firestore document and needs careful failure handling. Firestore Security Rules are the data boundary; route guards are only navigation controls. Rules must be deployed and tested separately from the website image.

The private `@saintrelion/*` data and UI packages reduce duplicated app code, but access to them is required for a fresh install or image build. The data-access library retains provider abstractions, although this application's current configuration selects Firebase. A next iteration should evaluate whether those abstractions still earn their maintenance cost. Attendance evaluation currently coordinates record and hour updates in the browser; transactional or server-owned updates would be worth revisiting before relying on it for high-stakes records.

## Architecture and release lifecycle

The React frontend reads and writes Firestore through the SaintRelion data-access layer and uses Firebase Authentication for identity. There is no Django or other application API in this repository, and no SQL database or migration job. Local development uses `pnpm dev` inside `website/`. The main-branch workflow checks build inputs and deployment-script syntax, then builds and publishes a commit-SHA website image and invokes a production Kubernetes rollout. Those checks do **not** run frontend tests or lint. A separate workflow can deploy an already published commit. There is no staging environment in the checked-in workflow. Firebase rules have their own `firebase.json` configuration and are not deployed by the website release workflow.

The documented hosting path is Kubernetes behind Traefik and a shared Cloudflare tunnel. The private server manifests are not included in this public repository. Browser-visible Firebase configuration is built into the image; changing it requires a new build.

## Known limitations

- The first administrator must be provisioned in Firebase Authentication and `ojt_User` manually; there is no public setup-admin route.
- Creating additional Auth users and Firestore profiles is coordinated in the browser. Removing a profile does not remove its Auth account.
- Attendance review and remaining-hour updates are separate client-driven operations, not one transaction. The UI's shift order is likewise not a security rule.
- The release validation workflow does not run the app's test suite or lint, and this repository has no staging workflow.
- Building from source requires access to private packages. The public HTML previews are illustrative only.

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
