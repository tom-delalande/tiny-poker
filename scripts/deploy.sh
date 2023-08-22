#!/bin/bash

echo "Fetching remote repository..."
git fetch

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

if [ $LOCAL = $REMOTE ]; then
    echo "No changes detected in git"
elif [ $LOCAL = $BASE ]; then
    git pull

    BUILD_VERSION=$(git rev-parse HEAD)
    echo "Changes detected, deploying new version: $BUILD_VERSION"
    echo "Running docker build"
    BUILD_VERSION=$BUILD_VERSION docker-compose build server nginx client

    echo "Running client container"
    BUILD_VERSION=$BUILD_VERSION docker-compose run client

    echo "Releasing new server version"
    BUILD_VERSION=$BUILD_VERSION docker rollout server
    BUILD_VERSION=$BUILD_VERSION docker-compose up -d --no-deps --scale server=1 --no-recreate server
elif [ $REMOTE = $BASE ]; then
     echo "Local changes detected, you may need to stashing"
     git stash
else
     echo "Git is diverged, this is unexpected."
fi
