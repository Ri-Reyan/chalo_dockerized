# ==============================================================================
# Stage 1: Build Dependencies
# ==============================================================================
FROM node:20-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# ==============================================================================
# Stage 2: Application Build
# ==============================================================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NOTE: Next.js inlines NEXT_PUBLIC_* variables into client-side bundles at build time.
# To override for a specific backend URL, pass --build-arg NEXT_PUBLIC_API_URL=<url>
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Run Next.js production build with output: "standalone"
RUN npm run build

# ==============================================================================
# Stage 3: Production Runner (Standalone)
# ==============================================================================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Leverage Next.js standalone output (includes minimal server.js and pruned node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# Run minimal standalone server directly with node
CMD ["node", "server.js"]
