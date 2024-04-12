build-amd64:
	docker build -t sodal/cartographer-mvp:v0.0.1-amd64 --platform=linux/amd64 .

run-local:
	docker-compose -f docker-compose.local.yml up

run-mvp:
	docker-compose -f docker-compose.mvp.yml up

