# Stolen from: https://www.tines.com/blog/simple-zero-downtime-deploys-with-nginx-and-docker-compose
reload_nginx() {
  docker exec nginx /usr/sbin/nginx -s reload
}

zero_downtime_deploy() {
  service_name=$1
  old_container_id=$(docker ps -f name=$service_name -q | tail -n1)

  # bring a new container online, running new code
  # (nginx continues routing to the old container only)
  docker-compose up -d --no-deps --scale $service_name=2 --no-recreate $service_name

  # wait for new container to be available
  new_container_id=$(docker ps -f name=$service_name -q | head -n1)
  new_container_ip=$(docker port $new_container_id | head -1 | rev | cut -d' ' -f1 | rev)

  curl --silent --include --retry-connrefused --retry 30 --retry-delay 1 --fail http://$new_container_ip/api/health-check || exit 1

  # start routing requests to the new container (as well as the old)  
  reload_nginx

  # take the old container offline  
  echo stopping $old_container_id
  docker stop $old_container_id
  docker rm $old_container_id

  docker-compose up -d --no-deps --scale $service_name=1 --no-recreate $service_name

  # stop routing requests to the old container  
  reload_nginx  
}

git pull
zero_downtime_deploy "server"
docker-compose up
