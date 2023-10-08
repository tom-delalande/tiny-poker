#!/bin/bash

echo "$(date --utc +%FT%TZ): Fetching remote repository..."
git fetch

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

if [ $LOCAL = $REMOTE ]; then
    echo "$(date --utc +%FT%TZ): No changes detected in git"
elif [ $LOCAL = $BASE ]; then
    git pull

    BUILD_VERSION=$(git rev-parse HEAD)
    echo "$(date --utc +%FT%TZ): Changes detected, deploying new version: $BUILD_VERSION"
    echo "$(date --utc +%FT%TZ): Running docker build"
    BUILD_VERSION=$BUILD_VERSION docker-compose build client
    echo "$(date --utc +%FT%TZ): Running client container"
    BUILD_VERSION=$BUILD_VERSION docker-compose run client

    cd ../nginx-server
    BUILD_VERSION=$BUILD_VERSION docker-compose build tiny-poker-server

    echo "$(date --utc +%FT%TZ): Releasing new server version"
    BUILD_VERSION=$BUILD_VERSION docker rollout server
    BUILD_VERSION=$BUILD_VERSION docker-compose up -d --no-deps --scale tiny-poker-server=1 --no-recreate tiny-poker-server
elif [ $REMOTE = $BASE ]; then
     echo "$(date --utc +%FT%TZ): Local changes detected, you may need to stashing"
     git stash
else
     echo "$(date --utc +%FT%TZ): Git is diverged, this is unexpected."
fi
