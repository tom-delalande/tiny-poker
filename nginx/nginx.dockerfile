FROM nginx:stable-alpine

WORKDIR app

COPY nginx/nginx.conf nginx.conf

EXPOSE 80

CMD nginx -c /app/nginx.conf
