### Vue 3 Dockerfile for Production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /home/coin/Desktop/f

# Install necessary tools and build dependencies
RUN apk add --no-cache bash git openssh-client

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy all source files
COPY . .

# Build the application
RUN npm run build

### Serve Vue App using lightweight server
FROM node:18-alpine

# Set working directory
WORKDIR /home/coin/Desktop/f

# Copy built files from the builder stage
COPY --from=builder /home/coin/Desktop/f/dist .

# Install lightweight HTTP server for static content
RUN npm install -g http-server

# Ensure proper permissions
RUN chmod -R 755 /home/coin/Desktop/f && chown -R node:node /home/coin/Desktop/f

# Expose the frontend port
EXPOSE 8080

# Start the HTTP server
USER node
CMD ["http-server", "-p", "8080"]
