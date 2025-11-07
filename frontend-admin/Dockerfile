# syntax=docker/dockerfile:1
# Version 1.0.1 - Dockerfile for SharePrinto Admin Frontend

# --- Base image ---
    FROM node:18-alpine AS base

    # --- Dependencies stage ---
    FROM base AS deps
    RUN apk add --no-cache libc6-compat
    WORKDIR /app
    
    # ✅ Copy only from the correct folder (avoid grabbing root package.json)
    COPY package*.json ./
    
    # Install all dependencies (including dev) needed for building
    RUN npm ci
    
    # --- Build stage ---
    FROM base AS builder
    WORKDIR /app
    
    # Copy dependencies from deps
    COPY --from=deps /app/node_modules ./node_modules
    
    # ✅ Copy full app source
    COPY . .
    
    # Disable Next.js telemetry during build
    ENV NEXT_TELEMETRY_DISABLED=1
    
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
    RUN mkdir .next && chown nextjs:nodejs .next
    # Copy standalone output (includes public files automatically)
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
    # Copy public directory separately if it exists (fallback for standalone output)
    # Next.js standalone should include public, but we copy as backup
    RUN --mount=from=builder,source=/app,target=/tmp/builder,ro \
        if [ -d /tmp/builder/public ] && [ -n "$(ls -A /tmp/builder/public 2>/dev/null)" ]; then \
            mkdir -p ./public && cp -r /tmp/builder/public/* ./public/ 2>/dev/null || true; \
        fi
    
    USER nextjs
    
    # Expose the app port
    EXPOSE 3003
    
    # Start the Next.js standalone server
    CMD ["node", "server.js"]
    