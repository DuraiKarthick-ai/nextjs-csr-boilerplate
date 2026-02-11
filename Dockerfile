# ---- Build stage ----
FROM node:18-alpine AS builder
WORKDIR /app

# Build-time public envs (optional)
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_PING_ISSUER
ARG NEXT_PUBLIC_PING_CLIENT_ID
ARG NEXT_PUBLIC_PING_REDIRECT_URI
ARG NEXT_PUBLIC_PING_LOGOUT_URI
ARG NEXT_PUBLIC_PING_SCOPE
ARG SKIP_ENV_VALIDATION

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_PING_ISSUER=${NEXT_PUBLIC_PING_ISSUER}
ENV NEXT_PUBLIC_PING_CLIENT_ID=${NEXT_PUBLIC_PING_CLIENT_ID}
ENV NEXT_PUBLIC_PING_REDIRECT_URI=${NEXT_PUBLIC_PING_REDIRECT_URI}
ENV NEXT_PUBLIC_PING_LOGOUT_URI=${NEXT_PUBLIC_PING_LOGOUT_URI}
ENV NEXT_PUBLIC_PING_SCOPE=${NEXT_PUBLIC_PING_SCOPE}
ENV SKIP_ENV_VALIDATION=${SKIP_ENV_VALIDATION}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Run stage ----
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Copy only what's needed by standalone runtime
# (after next build, the server & node_modules are inside .next/standalone)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Start the server produced by Next standalone
CMD ["node", "server.js"]
# (If your build outputs `.next/standalone/server.js`, use that exact path)