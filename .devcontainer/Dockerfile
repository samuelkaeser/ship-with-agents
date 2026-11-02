FROM mcr.microsoft.com/devcontainers/typescript-node:22

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    DISABLE_AUTOUPDATER=1 \
    PATH=/home/node/.local/bin:$PATH

# The base image ships its own global pnpm, which would shadow the corepack one
RUN npm rm -g pnpm && corepack enable

USER node
# Pinned and pre-downloaded into node's corepack cache: the first `pnpm` call neither asks nor needs the network
RUN corepack prepare pnpm@10.28.2 --activate
# Claude Code is pinned; the workshop must not change under the students' feet
RUN curl -fsSL https://claude.ai/install.sh | bash -s 2.1.316
