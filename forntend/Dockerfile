# ============================================================
# 🧱 Next.js Production Dockerfile
# Version: 1.0.0
# Maintainer: Your Name <your@email.com>
# ============================================================

# 1️⃣ Base image (Node 18 Alpine)
FROM node:18-alpine AS base
LABEL version="1.0.0" \
      maintainer="Your Name <your@email.com>" \
      description="Docker image for Next.js frontend in production mode."

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 2️⃣ Dependencies stage
FROM base AS deps
COPY package.json package-lock.json* ./
# Install all dependencies (including dev) needed for building
RUN npm ci


# 3️⃣ Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js
RUN npm run build

# 4️⃣ Production runtime stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy public directory if it exists (Next.js standalone may not include it)
# Use a conditional copy to avoid errors if public doesn't exist
RUN --mount=from=builder,source=/app,target=/tmp/builder,ro \
    if [ -d /tmp/builder/public ] && [ -n "$(ls -A /tmp/builder/public 2>/dev/null)" ]; then \
        mkdir -p ./public && cp -r /tmp/builder/public/* ./public/ 2>/dev/null || true; \
    fi

# Set correct permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start app
CMD ["node", "server.js"]
