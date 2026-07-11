#!/bin/bash
# SUOP Backend — Development Start Script
# Loads env vars from .env file explicitly (Bun loads root .env by default)

cd "$(dirname "$0")/.."

# Load .env file
set -a
source .env
set +a

exec bun run src/main.ts
