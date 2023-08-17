pull_changes() {
    git pull
}

deploy_nginx() {
    nginx -s reload -c $(pwd)/nginx/nginx.conf
}

deploy_client() {
    mkdir -p /live/tiny-poker/web
    mkdir -p client/dist
    ln $(pwd)/client/dist /live/tiny-poker/web

    cd client
    npm install
    npm run build
}

deploy_server() {
    cd server
    go build -o app src/main.go
    if [ -n "$(lsof -t -i :9001)" ]; then
        old_port=9001
        new_port=9002
    else
        old_port=9002
        new_port=9001
    fi

    PORT=$new_port ./app &>/dev/null &
    old_pid=$(lsof -t -i :$old_port)

    if [ -n "$old_pid" ]; then
        kill $old_pid
    fi
}

deploy_nginx
deploy_client
deploy_server
