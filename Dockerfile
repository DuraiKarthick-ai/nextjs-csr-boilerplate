# ---- Build stage: installs deps and builds the app ----
FROM node:18-alpine AS builder
WORKDIR /app



# Accept build-time env values (these must be provided during docker build)
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_PING_ISSUER
ARG NEXT_PUBLIC_PING_CLIENT_ID
ARG NEXT_PUBLIC_PING_REDIRECT_URI
ARG NEXT_PUBLIC_PING_LOGOUT_URI
ARG NEXT_PUBLIC_PING_SCOPE
ARG SKIP_ENV_VALIDATION

# Make them available to the build process (Next.js reads process.env at build time)
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_PING_ISSUER=${NEXT_PUBLIC_PING_ISSUER}
ENV NEXT_PUBLIC_PING_CLIENT_ID=${NEXT_PUBLIC_PING_CLIENT_ID}
ENV NEXT_PUBLIC_PING_REDIRECT_URI=${NEXT_PUBLIC_PING_REDIRECT_URI}
ENV NEXT_PUBLIC_PING_LOGOUT_URI=${NEXT_PUBLIC_PING_LOGOUT_URI}
ENV NEXT_PUBLIC_PING_SCOPE=${NEXT_PUBLIC_PING_SCOPE}
ENV SKIP_ENV_VALIDATION=${SKIP_ENV_VALIDATION}

# Install dependencies
COPY package*.json ./
RUN npm ci --production=false

# Copy source and build
COPY . .
RUN npm run build

# ---- Run stage: lightweight runtime image ----
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built app and only what's needed to run
COPY --from=builder /app ./

# Cloud Run expects the container to listen on the port provided via $PORT
# Default to 8080 which is the Cloud Run default.
ENV PORT=8080
EXPOSE 8080

# Start the Next.js server in production. The npm start script uses $PORT.
CMD ["npm", "start"]
