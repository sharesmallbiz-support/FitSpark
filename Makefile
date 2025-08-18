# FitSpark Build Automation

.PHONY: help install build clean dev production docker

help: ## Show this help message
	@echo "FitSpark Build Commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	npm ci
	dotnet restore FitSpark.Api/FitSpark.Api.csproj

build: ## Build client and API
	npm run build
	dotnet build FitSpark.Api/FitSpark.Api.csproj

build-production: ## Build for production
	npm run build
	dotnet build FitSpark.Api/FitSpark.Api.csproj --configuration Release

clean: ## Clean all build outputs
	rm -rf FitSpark.Api/wwwroot/*
	dotnet clean FitSpark.Api/FitSpark.Api.csproj

dev: ## Start development servers
	@echo "Start API server in one terminal: make start-api"
	@echo "Start client dev server in another: npm run dev"

start-api: ## Start API server only
	dotnet run --project FitSpark.Api/FitSpark.Api.csproj

production: build ## Build and start production server
	cd FitSpark.Api && dotnet run --configuration Release

docker: ## Build and run with Docker
	docker-compose up --build -d

docker-stop: ## Stop Docker containers
	docker-compose down

deploy: ## Build and publish for deployment
	npm run build
	dotnet publish FitSpark.Api/FitSpark.Api.csproj -c Release -o ./publish
