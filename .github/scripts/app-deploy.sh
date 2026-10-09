#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
umask 077
[[ "${DEPLOY_ENVIRONMENT:-}" == production ]]
[[ "${RELEASE_SHA:-}" =~ ^[0-9a-f]{40}$ ]]
git cat-file -e "$RELEASE_SHA^{commit}"
git merge-base --is-ancestor "$RELEASE_SHA" origin/main
namespace=fieldwork-operations
: "${KUBECONFIG:?Missing namespace-scoped Kubernetes credentials}"
server=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
printf '%s' "$server" | python -c 'import ipaddress,sys; from urllib.parse import urlparse; u=urlparse(sys.stdin.read()); assert u.scheme == "https" and u.port == 6443 and ipaddress.ip_address(u.hostname) in ipaddress.ip_network("100.64.0.0/10"), "Use private Tailscale Kubernetes API"'
[[ $(kubectl config view --minify -o jsonpath='{.contexts[0].context.namespace}') == "$namespace" ]]
kubectl -n "$namespace" get deployment website >/dev/null
[[ "$WEBSITE_IMAGE_NAME" =~ ^ghcr.io/[a-z0-9_./-]+$ ]]
digest=$(docker buildx imagetools inspect "$WEBSITE_IMAGE_NAME:$RELEASE_SHA" | awk '$1 == "Digest:" && !found { print $2; found=1 }')
[[ "$digest" =~ ^sha256:[0-9a-f]{64}$ ]]
export WEBSITE_IMAGE_REF="$WEBSITE_IMAGE_NAME@$digest"
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT
python - "$work/patch.json" <<'PY'
import json,os,sys
patch={"spec":{"template":{"metadata":{"annotations":{"fieldwork-operations.srecosystem.space/release":os.environ["RELEASE_SHA"]}},"spec":{"containers":[{"name":"website","image":os.environ["WEBSITE_IMAGE_REF"]}]}}}}
with open(sys.argv[1],"w") as f: json.dump(patch,f)
PY
kubectl -n "$namespace" patch deployment/website --type=strategic --patch-file "$work/patch.json"
kubectl -n "$namespace" rollout status deployment/website --timeout=600s
{
  echo "### Deployed FieldworkOperations"
  echo "Commit: $RELEASE_SHA"
  echo "Image: $WEBSITE_IMAGE_REF"
  echo "Namespace: $namespace"
} >> "$GITHUB_STEP_SUMMARY"
