.PHONY: help dev build up down logs clean install test lint

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start development environment
	docker-compose -f docker-compose.dev.yml up --build

build: ## Build all containers
	docker-compose build

up: ## Start production environment
	docker-compose up -d

down: ## Stop all containers
	docker-compose down

logs: ## Show logs from all containers
	docker-compose logs -f

clean: ## Remove all containers, networks, volumes
	docker-compose down -v --remove-orphans
	docker system prune -f

install-frontend: ## Install frontend dependencies
	cd frontend && npm install

install-backend: ## Install backend dependencies
	cd backend && pip install -r requirements.txt

test-frontend: ## Run frontend tests
	cd frontend && npm test

test-backend: ## Run backend tests
	cd backend && python -m pytest

lint-frontend: ## Lint frontend code
	cd frontend && npm run lint

lint-backend: ## Lint backend code
	cd backend && ruff check .

setup: ## Initial setup
	cp .env.example .env
	@echo "Created .env file. Please update it with your configuration."

install-mcp: ## Install MCP servers locally
	./mcp/scripts/install_mcp.sh

test-mcp: ## Test MCP servers
	cd mcp && python scripts/test_mcp.py

mcp-dev: ## Start MCP development environment
	docker-compose -f docker-compose.dev.yml up --build mcp

test-superclaude: ## Test SuperClaude Framework integration
	python3 scripts/test_superclaude.py