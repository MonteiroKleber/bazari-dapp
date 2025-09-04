# Bazari Makefile
# Convenient commands for development

.PHONY: help install dev build test clean docker-up docker-down docker-restart setup

# Colors
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)Bazari Development Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	pnpm install

dev: ## Start development server
	@echo "$(GREEN)Starting development server...$(NC)"
	pnpm dev

build: ## Build for production
	@echo "$(YELLOW)Building for production...$(NC)"
	pnpm build

test: ## Run tests
	@echo "$(YELLOW)Running tests...$(NC)"
	pnpm test

lint: ## Run linting
	@echo "$(YELLOW)Running linter...$(NC)"
	pnpm lint

format: ## Format code
	@echo "$(YELLOW)Formatting code...$(NC)"
	pnpm format

clean: ## Clean all build artifacts and dependencies
	@echo "$(RED)Cleaning project...$(NC)"
	pnpm clean
	rm -rf node_modules
	rm -rf apps/*/dist
	rm -rf apps/*/build
	rm -rf apps/*/.turbo
	rm -rf packages/*/dist
	rm -rf packages/*/build
	rm -rf packages/*/.turbo
	rm -rf .turbo

docker-up: ## Start Docker services
	@echo "$(GREEN)Starting Docker services...$(NC)"
	docker-compose -f infra/docker-compose.dev.yml up -d

docker-down: ## Stop Docker services
	@echo "$(YELLOW)Stopping Docker services...$(NC)"
	docker-compose -f infra/docker-compose.dev.yml down

docker-restart: docker-down docker-up ## Restart Docker services

docker-logs: ## Show Docker logs
	docker-compose -f infra/docker-compose.dev.yml logs -f

docker-clean: ## Clean Docker volumes
	@echo "$(RED)Cleaning Docker volumes...$(NC)"
	docker-compose -f infra/docker-compose.dev.yml down -v

setup: ## Run initial setup
	@echo "$(GREEN)Running initial setup...$(NC)"
	chmod +x scripts/setup.sh
	./scripts/setup.sh

web-dev: ## Start only web app in dev mode
	pnpm -F @bazari/web dev

api-dev: ## Start only API in dev mode (when available)
	pnpm -F @bazari/api dev

studio-dev: ## Start only Studio in dev mode (when available)
	pnpm -F @bazari/studio dev

db-migrate: ## Run database migrations (when API is ready)
	pnpm -F @bazari/api prisma migrate dev

db-seed: ## Seed database (when API is ready)
	pnpm -F @bazari/api prisma db seed

db-studio: ## Open Prisma Studio (when API is ready)
	pnpm -F @bazari/api prisma studio

check: ## Run all checks (lint, type-check, test)
	@echo "$(YELLOW)Running all checks...$(NC)"
	pnpm lint
	pnpm build
	pnpm test

fresh: clean install docker-restart ## Fresh install (clean + install + restart docker)
	@echo "$(GREEN)Fresh installation complete!$(NC)"

logs-web: ## Show web app logs
	pnpm -F @bazari/web dev

logs-api: ## Show API logs (when available)
	pnpm -F @bazari/api dev

status: ## Show status of all services
	@echo "$(GREEN)Service Status:$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker Services:$(NC)"
	@docker-compose -f infra/docker-compose.dev.yml ps
	@echo ""
	@echo "$(YELLOW)Node Processes:$(NC)"
	@ps aux | grep -E "node|vite" | grep -v grep || echo "No Node processes running"

version: ## Show version information
	@echo "$(GREEN)Bazari Version Information:$(NC)"
	@echo "Project Version: $$(cat package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[",]//g')"
	@echo "Node Version: $$(node -v)"
	@echo "pnpm Version: $$(pnpm -v)"
	@echo "Docker Version: $$(docker --version)"
	@echo "Docker Compose Version: $$(docker-compose --version)"

.DEFAULT_GOAL := help