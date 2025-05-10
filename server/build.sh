#!/usr/bin/env bash

# Install dependencies
yarn install

# Generate Prisma client
yarn prisma generate

# Run migrations (for production, use migrate deploy)
yarn prisma migrate deploy

# Build TypeScript
yarn build 