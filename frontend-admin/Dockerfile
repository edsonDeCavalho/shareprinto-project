# syntax=docker/dockerfile:1
# Version 1.0.0 - Dockerfile for SharePrinto Admin Frontend

# --- Base image ---
    FROM node:18-alpine AS base

    # --- Dependencies stage ---
    FROM base AS deps
    RUN apk add --no-cache libc6-compat
    WORKDIR /app
    
    # Copy and install dependencies (optimized for CI/CD)
    COPY package.json package-lock.json* ./
    RUN npm ci --only=production
    
    # --- Build stage ---
    FROM base AS builder
    WORKDIR /app
    
    # Copy node_modules from deps and app source
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    # Disable Next.js telemetry during build
    ENV NEXT_TELEMETRY_DISABLED 1
    
    # Build the Next.js app
    RUN npm run build
    
    # --- Production runtime ---
    FROM base AS runner
    WORKDIR /app
    
    # Set environment
    ENV NODE_ENV=production
    ENV NEXT_TELEMETRY_DISABLED=1
    ENV PORT=3003
    ENV HOSTNAME="0.0.0.0"
    
    # Create non-root user
    RUN addgroup --system --gid 1001 nodejs \
        && adduser --system --uid 1001 nextjs
    
    # Copy build output
    COPY --from=builder /app/public ./public
    RUN mkdir .next && chown nextjs:nodejs .next
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
    
    USER nextjs
    
    # Expose the correct port (matches docker-compose.yml)
    EXPOSE 3003
    
    # Start the Next.js standalone server
    CMD ["node", "server.js"]
    