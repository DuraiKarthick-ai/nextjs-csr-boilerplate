# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments for environment variables
ARG NEXT_PUBLIC_APP_URL=https://placeholder.app
ARG NEXT_PUBLIC_API_BASE_URL=https://placeholder.api
ARG NEXT_PUBLIC_PING_ISSUER=https://placeholder.issuer
ARG NEXT_PUBLIC_PING_CLIENT_ID=placeholder-client-id
ARG NEXT_PUBLIC_PING_REDIRECT_URI=https://placeholder.app/auth/callback
ARG NEXT_PUBLIC_PING_LOGOUT_URI=https://placeholder.app/logout
ARG NEXT_PUBLIC_PING_SCOPE="openid profile email"

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Temporarily rename .eslintrc.json to skip ESLint during build
RUN mv .eslintrc.json .eslintrc.json.bak || true

# Set environment variables from build args
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_PING_ISSUER=$NEXT_PUBLIC_PING_ISSUER
ENV NEXT_PUBLIC_PING_CLIENT_ID=$NEXT_PUBLIC_PING_CLIENT_ID
ENV NEXT_PUBLIC_PING_REDIRECT_URI=$NEXT_PUBLIC_PING_REDIRECT_URI
ENV NEXT_PUBLIC_PING_LOGOUT_URI=$NEXT_PUBLIC_PING_LOGOUT_URI
ENV NEXT_PUBLIC_PING_SCOPE=$NEXT_PUBLIC_PING_SCOPE

# Build the application (static export for CSR)
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install serve package to serve static files
RUN npm install -g serve

# Copy the exported static files from builder
COPY --from=builder /app/out ./out

# Expose port
EXPOSE 3000

# Serve the static files
CMD ["serve", "-s", "out", "-l", "3000"]