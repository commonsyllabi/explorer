run:
	godotenv -f ".env,.secrets" go run cmd/api/main.go

docker-run:
	docker compose down --volumes
	docker compose up

build:
	docker compose build

test:
	go clean -testcache && go test -p 1 ./... -cover

docker-test:
	make clean
	docker compose -f docker-compose.test.yml up --build --remove-orphans backend_test_explorer

clean:
	docker compose -f docker-compose.test.yml down
	docker compose -f docker-compose.test.yml down --volumes
	docker compose down
	docker compose down --volumes