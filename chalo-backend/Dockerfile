# ==============================================================================
# Stage 1: Build & Generate
# ==============================================================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install all dependencies (including devDependencies like typescript and prisma)
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and configuration
COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

# Generate Prisma 7 Client (uses prisma.config.ts and prisma/schema/*.prisma)
RUN npx prisma generate

# Copy source code and build TypeScript to dist/
COPY src ./src
RUN npm run build

# ==============================================================================
# Stage 2: Production Dependencies
# ==============================================================================
FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ==============================================================================
# Stage 3: Production Runner
# ==============================================================================
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Install OpenSSL and CA certificates for Prisma secure database connections
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=4000

# Copy minimal production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy generated Prisma Client assets (.prisma contains generated engines/wasm, @prisma/client is the JS client)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy dotenv from builder stage (imported at runtime in dist/server.js but declared in devDependencies)
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv

# Copy compiled JavaScript output
COPY --from=builder /app/dist ./dist

# Copy Prisma schema, migrations, and config for runtime reference and deployment migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY package.json ./

EXPOSE 4000

# Production startup entrypoint confirmed from package.json ("start": "node dist/server.js")
CMD ["node", "dist/server.js"]

