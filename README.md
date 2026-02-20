# -----------------------------
# DEV Dockerfile
# -----------------------------
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY . .

# Enable Next.js dev mode
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

# Run Next.js dev server
CMD ["npm", "run", "dev"]