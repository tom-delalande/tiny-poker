#!/bin/bash

echo "Fetching remote repository..."
git fetch

if [[ `git status --porcelain` ]]; then
    BUILD_VERSION = $(git rev-parse HEAD)
    echo "Changes detected, deploying new version: $BUILD_VERSION"
    git pull

    echo "Running docker build"
    docker-compose build server nginx client

    echo "Running client container"
    docker-compose run client

    echo "Releasing new server version"
    docker rollout server
else
    echo "No changes detected in git"
fi
