# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
"""Administrator setup: apply deployer RBAC and issue an expiring kubeconfig."""
import argparse
import json
import os
from pathlib import Path
import subprocess

def make_config(environment, server, ca, token):
    namespace = "fieldwork-operations"
    identity = "github-fieldwork-operations-deployer"
    return {
        "apiVersion": "v1", "kind": "Config",
        "clusters": [{"name": "fieldwork-operations", "cluster": {"server": server, "certificate-authority-data": ca}}],
        "users": [{"name": identity, "user": {"token": token}}],
        "contexts": [{"name": environment, "context": {"cluster": "fieldwork-operations", "user": identity, "namespace": namespace}}],
        "current-context": environment,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("environment", choices=["production"])
    parser.add_argument("--context", default="default", help="K3s administrator context on this server")
    parser.add_argument("--server", default="https://100.66.32.87:6443", help="Tailscale Kubernetes API endpoint for GitHub (default: %(default)s)")
    parser.add_argument("--duration", default="24h", help="Requested token lifetime; server may grant a different duration")
    parser.add_argument("--on-server", action="store_true", required=True, help="Run as root on the K3s server; local credential generation is not supported")
    args = parser.parse_args()
    if not hasattr(os, "geteuid") or os.geteuid() != 0:
        raise ValueError("On-server setup must run as root")
    os.environ["KUBECONFIG"] = "/etc/rancher/k3s/k3s.yaml"
    command = ["k3s", "kubectl", "--context", args.context]
    # ============================================================
    # MARK: Read cluster endpoint
    # Read the selected cluster CA; never copy administrator users.
    result = subprocess.run(command + ["config", "view", "--minify", "--flatten", "--raw", "-o", "json"], capture_output=True, text=True)
    if result.returncode:
        raise ValueError("Cannot read administrator context")
    cluster = json.loads(result.stdout)["clusters"][0]["cluster"]
    server, ca = args.server, cluster.get("certificate-authority-data", "")
    from urllib.parse import urlparse
    from ipaddress import ip_address, ip_network
    url = urlparse(server)
    try:
        host_ip = ip_address(url.hostname or "")
    except ValueError:
        raise ValueError("Deployment server must be a Tailscale IP on HTTPS port 6443") from None
    if url.scheme != "https" or url.port != 6443 or not ca or host_ip not in ip_network("100.64.0.0/10"):
        raise ValueError("Deployment server must be a Tailscale IP on HTTPS port 6443, with the cluster CA available")
    subprocess.run(command + ["apply", "-f", str(Path(__file__).resolve().parent / f"{args.environment}-rbac.yaml")], check=True, capture_output=True)
    result = subprocess.run(command + ["-n", "fieldwork-operations", "create", "token", "github-fieldwork-operations-deployer", "--duration", args.duration], capture_output=True, text=True)
    if result.returncode or not result.stdout.strip():
        raise ValueError("Token request failed; check administrator permissions and requested duration")
    config = make_config(args.environment, server, ca, result.stdout.strip())
    output = Path("/root") / "fieldwork-operations.kubeconfig"
    # ============================================================
    # MARK: Write deployer kubeconfig
    # Refuse symlinks and keep credentials off stdout and out of Git.
    if output.is_symlink():
        raise ValueError("Refusing symlink output")
    fd = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_TRUNC | getattr(os, "O_NOFOLLOW", 0), 0o600)
    os.chmod(output, 0o600)
    with os.fdopen(fd, "w") as stream:
        json.dump(config, stream, indent=2)
        stream.write("\n")
    print(f"Created {output} (private; requested token lifetime: {args.duration}).")
    print("Paste the complete file directly into the matching GitHub Environment KUBE_CONFIG secret.")
    print("The token expires: regenerate and upload KUBE_CONFIG before future deployments after expiry.")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, IndexError, OSError, subprocess.CalledProcessError) as error:
        raise SystemExit(f"Kubeconfig setup failed: {error}. Credentials were not printed.") from None
