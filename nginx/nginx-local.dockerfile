FROM nginx:stable-alpine

WORKDIR app

COPY nginx/nginx-local.conf nginx.conf

EXPOSE 80

CMD nginx -c /app/nginx.conf
