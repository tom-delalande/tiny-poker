FROM nginx:stable-alpine

WORKDIR app

EXPOSE 80

CMD nginx -c /app/nginx.conf
