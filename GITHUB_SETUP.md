# FieldworkOperations releases

GitHub builds one website image; Kubernetes consumes it. No Django, database
or migration Job is required. Production namespace: fieldwork-operations.
Domain: fieldwork-operations.srecosystem.space. No staging environment.

Repository Actions secret: SR_REACT_GITHUB_TOKEN, for private npm read access.
Production environment secret: KUBE_CONFIG. Environment variables: TS_CLIENT_ID
and TS_AUDIENCE. Use a separate Tailscale federated credential for
SaintRelion/FieldworkOperations and environment production; match its actual
GitHub OIDC subject if your account uses a custom subject format.
The workflow uses tag:github-deployer. No FRONTEND_ENV GitHub secret is needed.
The public Firebase web-app values live in committed website/.env and are baked
into the image by Vite. Keep private credentials out of that file.

Default published image: ghcr.io/saintrelion/fieldwork-operations-website:FULL_SHA.
Optional variable WEBSITE_IMAGE_NAME overrides the repository name.
GITHUB_TOKEN is automatically supplied for registry publication.
Commit [skip build] to skip publishing/deployment while retaining validation.
Manual Main release supports build_images=false. Deploy existing release accepts
an already-published full main SHA and changes images without rebuilding.

Apply server-owned definitions before the first deployment. Initial placeholder
image pull errors are expected until the release patches the real image.
CI preserves replica counts. Later standard YAML applies enforce the images
declared there, so keep private manifest image references current.
See private kubernetes/README.md for bootstrap, sync, certificate and tunnel steps.

## Local development and first administrator

Use Node.js 22, pnpm/Corepack, Git, a Firebase project, and access to the private `@saintrelion/*` packages. The repository's `website/.npmrc` selects GitHub Packages for that scope. Configure the read token provided by the package owner in your local package-manager credentials, not in a tracked file. For example:

```powershell
pnpm config set --global "//npm.pkg.github.com/:_authToken" "YOUR_TOKEN"
```

Create or select a Firebase project with a Web App and Cloud Firestore database. The committed `website/.env` holds public Web App configuration and is read by Vite for both development and image builds; never put private credentials in it. Review the target Firebase project before running against real records. Deploy and test `firestore.rules` separately from the website release.

From `website/`:

```powershell
corepack enable
pnpm install
pnpm dev
```

The development server uses port 5174. For a fresh database, enable the Email/Password provider in Firebase Authentication and create the first administrator there. Copy its UID, then create `ojt_User/{uid}` in Firestore with the same `id`, plus `email`, `firstName`, `lastName`, `username`, `department`, `role: "admin"`, `roles: ["admin"]`, and `isEnabled: true`. Sign in at `/login`; all roles share this portal. There is no public first-admin setup route. Administrators can register department advisers; advisers can register interns in their department. Deleting a Firestore profile does not delete the Firebase Auth account, so permanently deprovision the corresponding Auth user separately. Legacy Firestore password documents cannot be used for sign-in and should not be retained as a credential store.

## Optional local image-build test

The website service is behind the `image` Compose profile, so plain `docker compose up` does not start it. Set `SR_REACT_GITHUB_TOKEN` to a GitHub Packages read token in your shell, then from the repository root run:

```powershell
docker compose --profile image up -d --build
```

The image serves at `http://localhost:8081`. Stop that test with `docker compose --profile image down`. The token is mounted as a build secret for package installation, not copied into `website/.env` or the final image.
