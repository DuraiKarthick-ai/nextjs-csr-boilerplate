# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy only npm files
COPY package.json package-lock.json ./

# Install deps (npm only)
RUN npm ci

# Copy source
COPY . .

# Build Next.js app
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=development

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"]