# UI User Makefile
# Mirrors the package.json scripts for common development and CI tasks.
# See the backend standard Makefile for the project-wide convention.
#
# NOTE: Make targets use hyphens (e.g. test-coverage) rather than the colons
# used in pnpm script names, because ':' is reserved Make syntax. Each target
# invokes the canonical pnpm script it mirrors.

COMPOSE := docker compose
INFISICAL := $(shell which infisical 2>/dev/null)
INFISICAL_ENV ?= dev

.PHONY: help setup install dev build build-staging preview typecheck lint format test test-coverage test-e2e ci docker-build docker-up docker-down docker-logs docker-status docker-redeploy infisical-login infisical-init

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z][a-zA-Z0-9_.-]*:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies (pnpm install)
	pnpm install

setup: ## Install dependencies (alias for install)
	pnpm install

dev: ## Start the Vite development server (with Infisical if available)
	@if [ -n "$(INFISICAL)" ]; then \
		infisical run --env dev -- pnpm dev; \
	else \
		echo "Warning: infisical not found, falling back to pnpm dev"; \
		pnpm dev; \
	fi

build: ## Type-check and bundle into dist/ (Infisical env INFISICAL_ENV, default dev)
	@if [ -n "$(INFISICAL)" ]; then \
		infisical run --env $(INFISICAL_ENV) -- pnpm build; \
	else \
		echo "Warning: infisical not found, falling back to pnpm build"; \
		pnpm build; \
	fi

build-staging: ## Build for staging (--mode staging + Infisical staging env)
	@if [ -n "$(INFISICAL)" ]; then \
		infisical run --env staging -- pnpm build:staging; \
	else \
		echo "Warning: infisical not found, using local env + --mode staging"; \
		pnpm build:staging; \
	fi

preview: ## Serve the production build locally
	pnpm preview

typecheck: ## Run the TypeScript type checker
	pnpm typecheck

lint: ## Run Biome and ESLint
	pnpm lint

format: ## Format the codebase with Biome
	pnpm format

test: ## Run unit and component tests (Vitest)
	pnpm test

test-coverage: ## Run tests with coverage report
	pnpm test:coverage

test-e2e: ## Run Playwright end-to-end tests
	@echo "Note: run 'pnpm exec playwright install' first if browsers are missing."
	pnpm test:e2e

ci: ## CI gate: lint + typecheck + tests with coverage + build
	pnpm lint
	pnpm typecheck
	pnpm test:coverage
	pnpm build

docker-build: ## Build the Docker image
	$(COMPOSE) build

docker-up: ## Start the container (build + background, Infisical env INFISICAL_ENV, default dev)
	@if [ -n "$(INFISICAL)" ]; then \
		infisical run --env $(INFISICAL_ENV) -- $(COMPOSE) up --build -d; \
	else \
		echo "Warning: infisical not found, using local VITE_API_BASE_URL"; \
		$(COMPOSE) up --build -d; \
	fi

docker-down: ## Stop and remove the container
	$(COMPOSE) down

docker-logs: ## Tail container logs
	$(COMPOSE) logs -f

docker-status: ## Show container status
	$(COMPOSE) ps

docker-redeploy: ## Rebuild and restart in one command
	$(COMPOSE) up --build -d

infisical-login: ## Log in to Infisical Cloud (interactive)
	infisical login

infisical-init: ## Link local project to Infisical (interactive; writes .infisical.yaml)
	infisical init
