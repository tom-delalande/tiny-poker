FROM nginx

WORKDIR app

COPY nginx.conf nginx.conf

EXPOSE 80

CMD nginx -c /app/nginx.conf
