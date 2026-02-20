# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (including devDeps) for the build
COPY package.json yarn.lock ./

# Ensure devDependencies are installed during build so tools like ESLint and TypeScript
# are available when `yarn build` runs. NODE_ENV is explicitly set to development here.
ENV NODE_ENV=development
RUN yarn install --frozen-lockfile

# Copy source and build
COPY . .
RUN yarn build

# Stage 2: Create the production-ready image
FROM node:18-alpine

WORKDIR /app

# Copy built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies in the runtime image to keep it small
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile --production

# Expose the port your Next.js app listens on (default is 3000)
EXPOSE 3000

# Command to run the Next.js application
CMD ["yarn", "start"]
