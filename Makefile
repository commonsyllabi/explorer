.DEFAULT_GOAL:=help
SHELL:=/usr/bin/bash

.PHONY: docker-build docker-build-test docker-run docker-test-back docker-test-front docker-clean docker-rm docker-test-full

run: ## run the backend locally
	godotenv -f ".env,.secrets" go run cmd/api/main.go

test: ## run the backend tests locally
	go clean -testcache && godotenv -f ".secrets" go test -p 1 ./... -cover

docker-build: ## build the production container
	docker compose build

docker-build-test: ## build the test containers
	docker compose -f tests/docker-compose.yml build

docker-run: ## run the backend in a container
	docker compose down --volumes
	docker compose up

docker-test-back: docker-clean ## test the backend in a container
	docker compose -f tests/docker-compose.yml up --remove-orphans backend_test
	docker compose -f tests/docker-compose.yml down

docker-test-front: docker-clean docker-build-test ## test the frontend in a container
	docker compose -f tests/docker-compose.yml up -d --remove-orphans frontend
	cd www/ && yarn cypress:headless
	docker compose -f tests/docker-compose.yml down

docker-clean: ## brings down test and production containers
	docker compose -f tests/docker-compose.yml down --volumes
	docker compose down --volumes

docker-rm: ## removes all docker containers, networks and volumes
	docker rm -f $(docker ps -aq)
	docker network rm $(docker network ls -q)
	docker volume rm $(docker volume ls -q)

docker-test-full: docker-clean docker-rm docker-build-test docker-test-back docker-test-front ## clean all docker containers, and run frontend and backend tests

help:  ## display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
