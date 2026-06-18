# Stage 1: Build the Meteor application
FROM node:20-bookworm AS builder

# Install Meteor and its build dependencies
RUN apt-get update && apt-get install -y curl python3 g++ make && \
    curl https://install.meteor.com/ | sh

# Add Meteor to PATH and allow running as superuser inside docker
ENV PATH="/root/.meteor:$PATH"
ENV METEOR_ALLOW_SUPERUSER=1

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN meteor npm ci

# Copy the application source code
COPY . .

# Generate type declarations so Rspack's TypeScript compiler can resolve package modules
RUN meteor lint

# Build the Meteor application bundle to /app/build
RUN meteor build --directory /app/build --server-only

# Install production dependencies for the Meteor server bundle
WORKDIR /app/build/bundle/programs/server
RUN npm install --production

# Stage 2: Create the final production image
FROM node:lts-alpine3.24

WORKDIR /app

# Copy the built bundle from the builder stage
COPY --from=builder /app/build/bundle ./

# Define environment variables with sensible defaults
ENV PORT=3000
ENV MONGO_URL=mongodb://admin:admin@taskflow-mongo:27017/taskflow-app?authSource=admin
ENV ROOT_URL=http://localhost:3000

EXPOSE 3000

# Start the Meteor application server
CMD ["node", "main.js"]