#!/usr/bin/env bash

# Install dependencies
yarn install

# Generate Prisma Client
yarn prisma generate

# Run migrations
yarn prisma migrate deploy

# Build TypeScript
yarn build 