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
	# make clean
	# docker compose -f docker-compose.test.yml build 
	docker compose -f docker-compose.test.yml up -d --build --remove-orphans frontend_test_explorer
	cd www/ && yarn cypress:headless
	docker compose -f docker-compose.test.yml down

clean:
	docker compose -f docker-compose.test.yml down
	docker compose -f docker-compose.test.yml down --volumes
	docker compose down
	docker compose down --volumes

rm:
	docker rm -f $(docker ps -aq)
	docker network rm $(docker network ls -q)