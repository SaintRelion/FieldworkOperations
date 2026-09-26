# OJTLOG

OJTLOG is a role-based On-the-Job Training (OJT) attendance and management system built for **administrators, department advisers, and interns**. It covers attendance, OJT-hour tracking, evaluations, accomplishments, reports, and account management.

> **Project status:** Archived portfolio project. This version uses an older generation of my `@saintrelion/*` libraries, which are now deprecated.

## Key features

- **Four-step attendance** — interns follow `Time In → Break Out → Break In → Time Out`.
- **Location-aware attendance** — attendance can include timestamps, geolocation information, and captured images depending on permissions and workflow.
- **OJT-hour tracking** — tracks accumulated internship hours and progress.
- **Accomplishments and reports** — interns can maintain accomplishment records and DTR/report workflows.
- **Adviser workflows** — department advisers can monitor attendance, evaluate records, manage assigned interns, configure attendance settings, and track progress.
- **Administration** — administrators manage department advisers, interns, and accounts.
- **Role-based access** — separate workflows for administrators, department advisers, and interns.

## Screenshots

> Screenshots can be added from a restored/demo environment using synthetic or authorized data.

<!-- Suggested screenshots:
1. Intern dashboard / attendance
2. Four-step attendance workflow
3. Adviser dashboard
4. OJT hours / progress
5. DTR or reports
6. Admin account management
-->

## Technology stack

- React 19 + TypeScript
- Vite
- Firebase / Firestore
- TanStack Query
- Tailwind CSS
- Leaflet
- Vite PWA
- pnpm
- Private `@saintrelion/*` libraries

This version uses the SaintRelion Firebase provider for rapid online development/prototyping. The same library architecture also supported a local mock provider and a generic REST API provider.

## Access to private dependencies

This project depends on private `@saintrelion/*` packages. Required access tokens are **not included in the repository**.

Contact the developer for the package access required to build the archived project.

## Run with Docker

### 1. Configure Firebase

Create or select a Firebase project with a Web App and Cloud Firestore database.

Create `.env` from the provided `.env.example`:

```powershell
Copy-Item .env.example .env
```

Fill in `.env` using your Firebase Web App configuration.

### 2. Configure private package access

The project depends on private `@saintrelion/*` packages hosted on GitHub Packages. Contact the developer for the required package access, then expose the provided credential for the Docker build.

### 3. Build and run

```powershell
docker compose up -d --build
```

Then open:

```text
http://localhost:8080
```

Firebase `VITE_*` values are included during the Vite build, while the private package credential is supplied through the configured BuildKit secret.

## First administrator

A fresh Firestore database has no OJTLOG users. Use the temporary restoration route:

```text
/setup-admin
```

Create the first administrator, then sign in through:

```text
/admin/login
```

From the Admin dashboard, department adviser and intern accounts can then be registered. Regular interns and advisers use `/login`.

Remove or disable `/setup-admin` after initializing the database.

## Local development

Use this setup when running or modifying OJTLOG directly instead of using Docker.

### Requirements

- Node.js 22
- pnpm / Corepack
- Git
- A Firebase project
- Access to the private `@saintrelion/*` packages

### 1. Configure private package access

The project uses private `@saintrelion/*` packages hosted on GitHub Packages. Configure authentication using the credential provided by the developer:

```powershell
pnpm config set --global "//npm.pkg.github.com/:_authToken" "YOUR_TOKEN"
```

The project `.npmrc` already defines the `@saintrelion` package registry.

### 2. Configure Firebase

Create or select a Firebase project with a Web App and Cloud Firestore database.

Create a local `.env` from the provided `.env.example`:

```powershell
Copy-Item .env.example .env
```

Fill in `.env` using your Firebase Web App configuration.

### 3. Install dependencies

```powershell
corepack enable
pnpm install
```

### 4. Start the development server

```powershell
pnpm dev
```

Open the URL printed by Vite. The restored local configuration may use:

```text
http://localhost:5174
```

For a fresh Firestore database, complete the **First administrator** setup above.

## Author

**June Aurelius Jacinto**  
Full-Stack Software Developer

GitHub: https://github.com/SaintRelion
