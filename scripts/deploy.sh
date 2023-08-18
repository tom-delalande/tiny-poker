if [[ `git status --porcelain` ]]; then
    git pull
    docker compose build server nginx client
    docker compose run client
    ~/.docker/cli-plugins/docker-rollout server
fi
