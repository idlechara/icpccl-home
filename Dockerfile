# Build and dev environment for the site, pinned so every rebuild is identical.
#
#   base  Node, AWS CLI: what `npm run build` and scripts/deploy.sh need. Used by
#         GitHub Actions to build and deploy.
#   dev   base plus git and shell tools. Used by the devcontainer.
#
# Updating a pin: change the version and its digest or checksums together, never the
# tag alone. Commands to get them are next to each pin.

# node:22.23.2-trixie-slim (multi-arch index digest)
#   curl -s https://hub.docker.com/v2/repositories/library/node/tags/<tag> | jq -r .digest
FROM node:22.23.2-trixie-slim@sha256:c5849ff9c9ebcd66615412f0b548ca5b8ecaef84003dc9ac2e077ebe46aaa3f6 AS base

# AWS CLI v2, verified by checksum. The checksums were taken from installers whose
# signatures were checked against the AWS CLI key (FB5D B77F D5C1 18B8 0511 ADA8 A631 0ACC 4672 475C).
#   curl -sL https://awscli.amazonaws.com/awscli-exe-linux-<arch>-<version>.zip | sha256sum
ARG AWS_CLI_VERSION=2.37.6
ARG AWS_CLI_SHA256_X86_64=cd40c7d1f41b3a4964e77a65377e480d71fe6ebc96bbbb64eb2239d69af6fbb2
ARG AWS_CLI_SHA256_AARCH64=06b572cfd4b0397145a8173fb3456a6e6f0bea1bae50e9162a56be80a1e19618

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl unzip; \
    case "$(dpkg --print-architecture)" in \
      amd64) arch=x86_64;  sum="$AWS_CLI_SHA256_X86_64" ;; \
      arm64) arch=aarch64; sum="$AWS_CLI_SHA256_AARCH64" ;; \
      *) echo "Arquitectura no soportada" >&2; exit 1 ;; \
    esac; \
    curl -fsSLo /tmp/awscli.zip "https://awscli.amazonaws.com/awscli-exe-linux-${arch}-${AWS_CLI_VERSION}.zip"; \
    echo "${sum}  /tmp/awscli.zip" | sha256sum -c -; \
    unzip -q /tmp/awscli.zip -d /tmp; \
    /tmp/aws/install; \
    rm -rf /tmp/aws /tmp/awscli.zip /var/lib/apt/lists/*; \
    aws --version

WORKDIR /workspace

FROM base AS dev

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends git openssh-client less procps sudo; \
    echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node; \
    chmod 0440 /etc/sudoers.d/node; \
    rm -rf /var/lib/apt/lists/*

USER node
