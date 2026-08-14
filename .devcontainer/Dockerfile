FROM mcr.microsoft.com/devcontainers/typescript-node:4-24-bookworm

# The base image includes Corepack but points `yarn` at its legacy Yarn 1 install.
# Activate the bundled Corepack shim so package.json selects the pinned Yarn 4.
RUN corepack enable
