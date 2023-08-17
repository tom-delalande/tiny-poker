deploy_nginx() {
    if [ -n "$(lsof -t -i :9029)" ]; then
        nginx -s reload -c $(pwd)/nginx/nginx.conf
    else
        nginx -c $(pwd)/nginx/nginx.conf &
    fi
}

deploy_client() {
    mkdir -p /www/tiny-poker/
    mkdir -p client/dist
    ln -s $(pwd)/client/dist /www/tiny-poker/web

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

deploy_nginx
deploy_client
deploy_server
