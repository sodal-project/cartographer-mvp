ENV ?= dev
VNUM ?= v0.0.6
IMAGE ?= sodal/cartographer-mvp

run-local:
	echo "Running for environment ${ENV}"
	docker-compose -f docker-compose.yml up

build-amd64:
	docker build -t ${IMAGE}:${VNUM}-amd64 -t ${IMAGE}:latest --platform=linux/amd64 .

push-amd64:
	docker push ${IMAGE}:${VNUM}-amd64
	docker push ${IMAGE}:latest



