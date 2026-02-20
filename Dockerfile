# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build the application (static export for CSR)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
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