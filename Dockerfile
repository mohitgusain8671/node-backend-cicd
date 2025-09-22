# Use Node.js LTS version
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Development stage
FROM base AS development
ENV NODE_ENV=development
# Install all dependencies including dev dependencies
RUN npm ci
# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs
# Expose port
EXPOSE 3000
# Start the application in development mode
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
ENV NODE_ENV=production
# Remove dev dependencies and clean up
RUN npm prune --production
# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs
# Expose port
EXPOSE 3000
# Start the application
CMD ["npm", "start"]