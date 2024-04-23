include .env

IMAGE ?= sodal/cartographer-mvp
VNUM ?= 0.0.1
VNAME ?= amd64

run-local:
	echo "Running for environment ${ENV}"
	docker-compose -f docker-compose.yml up

build-amd64:
	docker build -t ${IMAGE}:${VNUM}-${VNAME} --platform=linux/amd64 .



