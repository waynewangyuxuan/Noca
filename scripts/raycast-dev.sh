#!/bin/bash

# Start Raycast extension in development mode

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAYCAST_DIR="$SCRIPT_DIR/../src/raycast"

cd "$RAYCAST_DIR"

echo "Installing dependencies..."
npm install

echo "Starting Raycast extension in dev mode..."
npm run dev
