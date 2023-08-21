#!/bin/bash

git fetch

if [[ `git status --porcelain` ]]; then
    git pull
    docker-compose build server nginx client
    docker-compose run -e BUILD_VERSION=$(git rev-parse HEAD) client
    ~/.docker/cli-plugins/docker-rollout -e BUILD_VERSION=$(git rev-parse HEAD) server
fi
