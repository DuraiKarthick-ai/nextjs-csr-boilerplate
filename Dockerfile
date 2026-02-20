# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* yarn.lock* ./

# Install deps (npm or yarn, whichever exists)
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# Copy source
COPY . .

# Build Next.js app
RUN npm run build || yarn build

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=development

# Copy only required files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]