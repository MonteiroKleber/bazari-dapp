#!/bin/bash

# Bazari Setup Script
# This script sets up the development environment for the Bazari ecosystem

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌟 Welcome to Bazari Setup!${NC}"
echo "This script will help you set up your development environment."
echo ""

# Check for required tools
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed. Please install it first.${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $1 is installed${NC}"
    fi
}

echo "Checking required tools..."
check_command node
check_command pnpm
check_command docker
check_command docker-compose

# Check Node version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be >= 18.0.0${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Node.js version is compatible${NC}"
fi

# Install dependencies
echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install

# Setup environment variables
echo ""
echo -e "${YELLOW}⚙️  Setting up environment variables...${NC}"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local from .env.example${NC}"
    echo -e "${YELLOW}📝 Please review and update .env.local with your settings${NC}"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# Start Docker services
echo ""
echo -e "${YELLOW}🐳 Starting Docker services...${NC}"
docker-compose -f infra/docker-compose.dev.yml up -d

# Wait for services to be ready
echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check service health
check_service() {
    if docker-compose -f infra/docker-compose.dev.yml ps | grep -q "$1.*Up"; then
        echo -e "${GREEN}✅ $1 is running${NC}"
    else
        echo -e "${RED}❌ $1 failed to start${NC}"
        echo "Check logs with: docker-compose -f infra/docker-compose.dev.yml logs $1"
    fi
}

check_service postgres
check_service redis
check_service ipfs
check_service opensearch

# Database setup (commented out as API is not yet implemented)
# echo ""
# echo -e "${YELLOW}🗄️  Setting up database...${NC}"
# pnpm -F @bazari/api prisma migrate dev
# pnpm -F @bazari/api prisma db seed

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "You can now start the development server with:"
echo -e "${YELLOW}  pnpm dev${NC}"
echo ""
echo "Available services:"
echo "  📱 Web App:     http://localhost:5173"
echo "  🔧 API:         http://localhost:3333"
echo "  💾 Database UI: http://localhost:8081"
echo "  🌐 IPFS:        http://localhost:8080"
echo "  🔍 OpenSearch:  http://localhost:9200"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"