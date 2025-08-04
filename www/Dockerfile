# syntax=docker.io/docker/dockerfile:1

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN rm .env*

ENV API_URL=https://cosyll-explorer.gestellt.net
ENV NEXT_PUBLIC_API_URL=https://cosyll-explorer.gestellt.net
ENV NEXTAUTH_URL=https://cosyll-explorer.gestellt.net/auth

ENV NEXT_PUBLIC_STORAGE_URL=https://cosyll.fra1.digitaloceanspaces.com
ENV ADMIN_KEY=e7b74bcd-c864-41ee-b666-d3031f76c800
ENV NEXTAUTH_SECRET=sozialegerechtigkeit

ENV NEXT_PUBLIC_MATOMO_URL=https://analytics.enframed.net
ENV NEXT_PUBLIC_MATOMO_SITE_ID=5
ENV FEATURED_SYLLABUS=c194a1f2-549b-442f-af01-0d4bab60a566
ENV FEATURED_COLLECTION=752b70e3-0d6b-4f72-8b77-0ec53c713db6
ENV FEATURED_PROFILE=e7b74bcd-c864-41ee-b666-d3031f76c800

RUN yarn next telemetry disable

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

ENV API_URL=https://cosyll-explorer.gestellt.net
ENV NEXT_PUBLIC_API_URL=https://cosyll-explorer.gestellt.net
ENV NEXTAUTH_URL=https://cosyll-explorer.gestellt.net/auth

ENV NEXT_PUBLIC_STORAGE_URL=https://cosyll.fra1.digitaloceanspaces.com
ENV ADMIN_KEY=e7b74bcd-c864-41ee-b666-d3031f76c800
ENV NEXTAUTH_SECRET=sozialegerechtigkeit

ENV NEXT_PUBLIC_MATOMO_URL=https://analytics.enframed.net
ENV NEXT_PUBLIC_MATOMO_SITE_ID=5
ENV FEATURED_SYLLABUS=c194a1f2-549b-442f-af01-0d4bab60a566
ENV FEATURED_COLLECTION=752b70e3-0d6b-4f72-8b77-0ec53c713db6
ENV FEATURED_PROFILE=e7b74bcd-c864-41ee-b666-d3031f76c800

USER nextjs

EXPOSE 3000

ENV PORT=3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
