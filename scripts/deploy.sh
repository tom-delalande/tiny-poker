deploy_nginx() {
    if [ -n "$(lsof -t -i :9029)" ]; then
        docker exec nginx nginx -s reload
    else
        docker compose up --build
    fi
}

deploy_client() {
    cd client
    npm install
    npm run build
    cd ..
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
    cd ..
}

deploy_client
deploy_server
