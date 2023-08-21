#!/bin/bash

echo "Fetching remote repository..."
git fetch

if [[ `git status --porcelain` ]]; then
    BUILD_VERSION=$(git rev-parse HEAD)
    echo "Changes detected, deploying new version: $BUILD_VERSION"
    git pull

    echo "Running docker build"
    BUILD_VERSION=$BUILD_VERSION docker-compose build server nginx client

    echo "Running client container"
    BUILD_VERSION=$BUILD_VERSION docker-compose run client

    echo "Releasing new server version"
    BUILD_VERSION=$BUILD_VERSION docker rollout server
    BUILD_VERSION=$BUILD_VERSION docker-compose up -d --no-deps --scale $service_name=1 --no-recreate $service_name
else
    echo "No changes detected in git"
fi
