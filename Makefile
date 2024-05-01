include .env

IMAGE ?= sodal/cartographer-mvp
VNUM ?= v0.0.2
VNAME ?= amd64

run-local:
	echo "Running for environment ${ENV}"
	docker-compose -f docker-compose.yml up

build-amd64:
	docker build -t ${IMAGE}:${VNUM}-${VNAME} --platform=linux/amd64 .

push-amd64:
	docker push ${IMAGE}:${VNUM}-${VNAME}



