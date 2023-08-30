FROM nginx:stable-alpine

RUN apk add certbot certbot-nginx

WORKDIR app

EXPOSE 80

CMD nginx -c /app/nginx.conf
