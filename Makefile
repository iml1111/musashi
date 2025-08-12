.PHONY: help dev build run stop logs clean install test test-e2e lint
.PHONY: docker-build docker-run docker-stop docker-restart docker-logs docker-clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Single Container Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^docker-[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ''
	@echo 'Legacy Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[^d][a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ========================================
# Single Container Targets (Recommended)
# ========================================

docker-build: ## Build Docker image for single container
	@echo "🔨 Building Musashi Docker image..."
	docker build -t musashi:latest -f Dockerfile.optimized .
	@echo "✅ Build complete!"

docker-run: ## Run Musashi as single container (Frontend:80, API:8080)
	@echo "🚀 Starting Musashi container..."
	@./run-musashi.sh

docker-stop: ## Stop Musashi container
	@echo "⏹️  Stopping Musashi container..."
	@docker stop musashi 2>/dev/null || true
	@docker rm musashi 2>/dev/null || true
	@echo "✅ Container stopped and removed"

docker-restart: ## Restart Musashi container
	@echo "🔄 Restarting Musashi container..."
	@docker restart musashi || (echo "Container not running, starting new one..." && make docker-run)

docker-logs: ## Show logs from Musashi container
	@docker logs -f musashi

docker-clean: ## Remove Musashi container and image
	@echo "🧹 Cleaning up Musashi container and image..."
	@docker stop musashi 2>/dev/null || true
	@docker rm musashi 2>/dev/null || true
	@docker rmi musashi:latest 2>/dev/null || true
	@echo "✅ Cleanup complete"

# ========================================
# Legacy Targets (Docker Compose)
# ========================================

dev: ## Start development mode (frontend and backend separately)
	@echo "Starting backend..."
	cd backend && uvicorn app.main:app --reload --port 8000 &
	@echo "Starting frontend..."
	cd frontend && npm run dev

build: ## Build Docker image
	docker build -t musashi .

run: ## Run Docker container
	docker run -d --name musashi-app -p 80:80 \
		-e MONGODB_URL=mongodb://host.docker.internal:27017 \
		-e DATABASE_NAME=musashi \
		-e SECRET_KEY=dev-secret-key \
		musashi

stop: ## Stop Docker container
	docker stop musashi-app && docker rm musashi-app

logs: ## Show logs from container
	docker logs -f musashi-app

clean: ## Remove container and image
	-docker stop musashi-app
	-docker rm musashi-app
	-docker rmi musashi
	docker system prune -f

install-frontend: ## Install frontend dependencies
	cd frontend && npm install

install-backend: ## Install backend dependencies
	cd backend && pip install -r requirements.txt

test-frontend: ## Run frontend tests
	cd frontend && npm test

test-backend: ## Run backend tests
	cd backend && python -m pytest

test-e2e: ## Run end-to-end tests with Playwright
	npx playwright test

lint-frontend: ## Lint frontend code
	cd frontend && npm run lint

lint-backend: ## Lint backend code
	cd backend && ruff check .

setup: ## Initial setup
	cp .env.sample .env
	@echo "Created .env file. Please update it with your configuration."


test-superclaude: ## Test SuperClaude Framework integration
	python3 scripts/test_superclaude.py