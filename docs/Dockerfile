# This will be set by the GitHub action if "__VITE_RUNTIME_BUILD" ENV is set in diploi.yaml
ARG __VITE_RUNTIME_BUILD=true

FROM node:22-alpine AS base

# Enable corepack
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# Setup PNPM
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
ENV CI=true
ENV PNPM_CONFIG_MINIMUM_RELEASE_AGE=0
ENV PNPM_CONFIG_STRICT_DEP_BUILDS=false

# Install Bun
COPY --from=oven/bun:1.3.11-alpine /usr/local/bin/bun /usr/local/bin/bun

# This will be set by the GitHub action to the folder containing this component.
ARG FOLDER=/app

# Install dependencies only when needed
FROM base AS deps

COPY . /app
WORKDIR ${FOLDER}

# Install dependencies based on the preferred package manager
RUN \
  if [ -f bun.lockb ] || [ -f bun.lock ]; then \
  bun install --frozen-lockfile || bun install; \
  elif [ -f yarn.lock ]; then \
  yarn install --frozen-lockfile || yarn install; \
  elif [ -f package-lock.json ]; then \
  npm ci || npm install; \
  elif [ -f pnpm-lock.yaml ]; then \
  pnpm install --frozen-lockfile || pnpm install; \
  elif [ -f package.json ]; then \
  echo "Lockfile not found. Falling back to npm install (non-deterministic install)."; \
  npm install; \
  else \
  echo "No package manifest found. Skipping install."; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
COPY . /app
WORKDIR ${FOLDER}
COPY --from=deps ${FOLDER}/node_modules ./node_modules

RUN \
  if [ -f bun.lockb ] || [ -f bun.lock ]; then bun run build; \
  elif [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm run build; \
  elif [ -f package.json ]; then npm run build; \
  else echo "No package manifest found. Skipping build step."; \
  fi

# When "__VITE_RUNTIME_BUILD" is false, only ship the built assets.
FROM base AS runner-false
ARG FOLDER
COPY --from=builder --chown=1000:1000 ${FOLDER}/node_modules ${FOLDER}/node_modules
COPY --from=builder --chown=1000:1000 ${FOLDER}/dist ${FOLDER}/dist
COPY --from=builder --chown=1000:1000 ${FOLDER}/package.json ${FOLDER}/package.json

# When "__VITE_RUNTIME_BUILD" is true, include entire app code. Build will be run again in an init-container.
FROM base AS runner-true
ARG FOLDER
COPY --from=builder --chown=1000:1000 /app /app

FROM runner-${__VITE_RUNTIME_BUILD} AS runner
ARG FOLDER

WORKDIR ${FOLDER}

ENV NODE_ENV=production

USER 1000:1000

EXPOSE 4321
ENV PORT=4321
ENV HOST="0.0.0.0"

CMD ["npm", "start"]