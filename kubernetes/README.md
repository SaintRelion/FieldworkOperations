# Fieldwork Operations Kubernetes

Fieldwork owns the manifests for its namespace and website. Shared cluster
services, operators, networking controllers, and certificates are managed in
ClusterInfrastructure. This app has no PostgreSQL or Redis operator resources.

```text
access/                              GitHub deployment RBAC and kubeconfig operation
base/website/                        Website Deployment and runtime ServiceAccount
base/services/                       Website ClusterIP Service
base/ingress/                        Website ingress template
base/security/                       Website network policy
production/                          Production composition and hostname overlay
production/services/                 Fieldwork namespace
production/configuration/ghcr/       Private image-pull credentials and tracked example
```

`base/kustomization.yaml` composes these focused components. Production adds the
namespace and production hostname. There is no API workload: the website talks to
Firebase directly. Shared controllers, operators, and certificates belong to
ClusterInfrastructure; Fieldwork has no PostgreSQL or Redis operator resources.

Tracked Kubernetes YAML and `*.example.yaml` files are the reviewed configuration.
Actual `secrets.yaml` files are ignored by Git and synced privately. Syncing files
does not apply them to Kubernetes. Use the focused Linux commands below when a
resource definition or configuration changes; routine releases update the image
through GitHub Actions.

## Sync from Windows

Keep the existing Mutagen session pointed at this `kubernetes` directory so the
new layout and private values sync together. The session must include Git-ignored
`secrets.yaml`; protect the destination with private directory and file permissions.
Do not use destructive sync modes to resolve conflicts.

```cmd
ssh saintrelion@100.66.32.87 "mkdir -p /home/saintrelion/fieldwork-operations/kubernetes && chmod 700 /home/saintrelion/fieldwork-operations /home/saintrelion/fieldwork-operations/kubernetes"
mutagen sync create --name fieldwork-operations --mode one-way-safe --ignore-vcs --ignore __pycache__ --ignore "*.pyc" --ignore "*.kubeconfig" --default-file-mode-beta 0600 --default-directory-mode-beta 0700 "D:\For Resume just pulling things\FieldworkOperations\kubernetes" "saintrelion@100.66.32.87:/home/saintrelion/fieldwork-operations/kubernetes"
mutagen sync flush fieldwork-operations
```

If the session already exists, inspect its source, destination, ignore rules, and
conflicts before flushing. The server destination must be the Fieldwork checkout.

## 1. Create the namespace

Run from the synced repository on the K3s server. The namespace is a separately
managed app resource; shared operators/controllers must already be installed by
ClusterInfrastructure.

```bash
sudo k3s kubectl apply -k ~/fieldwork-operations/kubernetes/production/services
```

## 2. Configure image pulls and GitHub access

Create the private registry Secret before applying configuration:

```bash
cp -n ~/fieldwork-operations/kubernetes/production/configuration/ghcr/secrets.example.yaml ~/fieldwork-operations/kubernetes/production/configuration/ghcr/secrets.yaml
sudoedit ~/fieldwork-operations/kubernetes/production/configuration/ghcr/secrets.yaml
```

Use a read-only GHCR credential and keep the real file out of Git and chat. Then
apply the configuration and create the GitHub deployment kubeconfig:

```bash
sudo k3s kubectl apply -k ~/fieldwork-operations/kubernetes/production/configuration
sudo python3 ~/fieldwork-operations/kubernetes/access/create-kubeconfig.py production --on-server --server https://100.66.32.87:6443 --duration 720h
```

The kubeconfig helper writes `/root/fieldwork-operations.kubeconfig` with mode 0600;
paste it into the GitHub production environment's `KUBE_CONFIG` secret. The token
expires, so regenerate and update that secret when deployments report expiration.
The script reads the cluster CA from the selected K3s admin context and configures
the GitHub kubeconfig to use the private Tailscale API endpoint explicitly.

## 3. Issue and publish the production certificate

This reuses the existing Certbot account and Cloudflare DNS credentials. The
certificate and its Kubernetes Secret are separate from the Ingress definition.
Run on the K3s server:

```bash
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  --cert-name fieldwork-operations.srecosystem.space \
  -d fieldwork-operations.srecosystem.space
```

Publish the renewed certificate into the app namespace without putting key material
in the terminal or a Secret annotation:

```bash
set -o pipefail
sudo k3s kubectl -n fieldwork-operations create secret tls fieldwork-operations-tls \
  --cert=/etc/letsencrypt/live/fieldwork-operations.srecosystem.space/fullchain.pem \
  --key=/etc/letsencrypt/live/fieldwork-operations.srecosystem.space/privkey.pem \
  --dry-run=client -o yaml |
sudo k3s kubectl -n fieldwork-operations apply \
  --server-side --field-manager=cluster-certificates -f -
```

Certbot renewal does not update the Kubernetes Secret. After each actual renewal,
repeat the publish command above. Shared certificate guidance is in
`~/cluster-infrastructure/kubernetes/certificates/README.md`.

## 4. Apply production application definitions

```bash
sudo k3s kubectl apply -k ~/fieldwork-operations/kubernetes/production
sudo k3s kubectl -n fieldwork-operations get deployments,services,ingress,networkpolicies
```

The production overlay composes the website, Service, Ingress, and network policy.
The website Deployment uses two replicas and preferred anti-affinity on
workload-labeled nodes. GitHub Actions pins released images by digest. After an
intentional manifest apply, run the release workflow to restore the released image.

## Public routing

Add `fieldwork-operations.srecosystem.space` to the existing Cloudflare tunnel,
using `traefik.kube-system.svc.cluster.local:443` as the HTTPS service. Set both
Origin Server Name and HTTP Host Header to that hostname, and keep No TLS Verify off.
The tunnel uses the shared Traefik service; no second connector is needed.

Authorize the production domain in Firebase Authentication and use appropriate
Firestore and Storage rules. Firebase web identifiers are public build-time
settings from `website/.env`; changing them requires a new website image.
