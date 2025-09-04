#!/bin/bash

# Bazari Clean Script
# Removes all build artifacts and dependencies

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧹 Cleaning Bazari project...${NC}"

# Remove node_modules
echo "Removing node_modules..."
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Remove build artifacts
echo "Removing build artifacts..."
find . -name "dist" -type d -prune -exec rm -rf '{}' +
find . -name "build" -type d -prune -exec rm -rf '{}' +
find . -name ".next" -type d -prune -exec rm -rf '{}' +
find . -name ".turbo" -type d -prune -exec rm -rf '{}' +
find . -name "out" -type d -prune -exec rm -rf '{}' +

# Remove cache directories
echo "Removing cache directories..."
find . -name ".cache" -type d -prune -exec rm -rf '{}' +
find . -name ".parcel-cache" -type d -prune -exec rm -rf '{}' +

# Remove coverage reports
echo "Removing coverage reports..."
find . -name "coverage" -type d -prune -exec rm -rf '{}' +

# Remove log files
echo "Removing log files..."
find . -name "*.log" -type f -delete
find . -name "npm-debug.log*" -type f -delete
find . -name "yarn-debug.log*" -type f -delete
find . -name "yarn-error.log*" -type f -delete
find . -name "pnpm-debug.log*" -type f -delete

# Remove lock files (optional)
read -p "Remove lock files (pnpm-lock.yaml)? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Removing lock files..."
    find . -name "pnpm-lock.yaml" -type f -delete
    find . -name "package-lock.json" -type f -delete
    find . -name "yarn.lock" -type f -delete
fi

echo -e "${GREEN}✅ Clean complete!${NC}"
echo ""
echo "Run 'pnpm install' to reinstall dependencies."