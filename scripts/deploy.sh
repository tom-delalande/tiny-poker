#!/bin/bash

echo "Fetching remote repository..."
git fetch

if git diff-index --quiet HEAD --; then
    echo "No changes detected in git"
else
    BUILD_VERSION=$(git rev-parse HEAD)
    echo "Changes detected, deploying new version: $BUILD_VERSION"
    git pull

    echo "Running docker build"
    BUILD_VERSION=$BUILD_VERSION docker-compose build server nginx client

    echo "Running client container"
    BUILD_VERSION=$BUILD_VERSION docker-compose run client

    echo "Releasing new server version"
    BUILD_VERSION=$BUILD_VERSION docker rollout server
    BUILD_VERSION=$BUILD_VERSION docker-compose up -d --no-deps --scale server=1 --no-recreate server
fi
