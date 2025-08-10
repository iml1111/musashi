.PHONY: help dev build run stop logs clean install test test-e2e lint

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

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
	cp .env.example .env
	@echo "Created .env file. Please update it with your configuration."


test-superclaude: ## Test SuperClaude Framework integration
	python3 scripts/test_superclaude.py