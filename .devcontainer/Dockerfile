FROM mcr.microsoft.com/devcontainers/typescript-node:1-24-bookworm

# Node 25+ no longer bundles Corepack. Pin it here; package.json pins Yarn itself.
RUN npm install --global corepack@0.35.0 \
    && corepack enable
