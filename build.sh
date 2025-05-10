#!/usr/bin/env bash

# Install dependencies (already done by yarn install in build command, but safe)
yarn install

# Generate Prisma client in server workspace
yarn workspace server prisma generate

# Run migrations in server workspace
yarn workspace server prisma migrate deploy

# Build TypeScript in server workspace
yarn workspace server build 