# ========================
# Stage 1: Builder
# ========================
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# ARG LOCAL_TLS_BYPASS=false
ENV NEXT_TELEMETRY_DISABLED=1

# Optional TLS bypass for local Docker builds only
# RUN if [ "$LOCAL_TLS_BYPASS" = "true" ]; then \
#       echo "Enabling local TLS bypass"; \
#       npm config set strict-ssl false; \
#       npm config set registry http://registry.npmjs.org/; \
#     fi

# Copy only dependency files first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci 
#--include=dev

# Required for Next build in Docker
RUN npm install next webpack --no-save
ENV NEXT_PRIVATE_LOCAL_WEBPACK=true

# Build arguments for environment variables that Next.js needs at BUILD time
ARG NEXT_PUBLIC_SIGNS_APP_URL
ARG SIGNS_API_BASE_URL=http://34.149.59.244
ARG NEXT_PUBLIC_PORTAL_REMOTE_URL_PROD

# Set as environment variables during build (baked into the JS bundle)
ENV NEXT_PUBLIC_SIGNS_APP_URL=$NEXT_PUBLIC_SIGNS_APP_URL
ENV SIGNS_API_BASE_URL=$SIGNS_API_BASE_URL
ENV NEXT_PUBLIC_PORTAL_REMOTE_URL_PROD=$NEXT_PUBLIC_PORTAL_REMOTE_URL_PROD

# Copy rest of source code
COPY . .

# Build Next app
RUN npx next build

# ========================
# Stage 2: Runtime (GKE Safe)
# ========================
FROM node:20-bullseye-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy runtime artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Do NOT bake certs or env files into image

# Default ports (HTTP inside container; TLS handled outside)

ENV PORT=3000
EXPOSE 3000
ENV HOST=0.0.0.0
CMD ["npm", "run", "start", "--", "-p", "3000", "-H", "0.0.0.0"]
