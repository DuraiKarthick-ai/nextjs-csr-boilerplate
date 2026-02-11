# ---- Build stage: installs deps and builds the app ----
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Run stage: lightweight runtime image ----
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built app and only what's needed to run
COPY --from=builder /app ./

# GKE Service exposes port 80; make the app listen on 80
ENV PORT=80
EXPOSE 80

# Start the Next.js server in production on port 80
CMD ["npm", "start"]
