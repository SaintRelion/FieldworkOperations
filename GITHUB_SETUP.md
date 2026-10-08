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
