FROM golang:1.21 as build
WORKDIR /app

COPY . .
RUN go mod download
RUN go build -o /bin/app ./src/main.go

FROM ubuntu:latest
WORKDIR /app
COPY --from=build /bin/app ./app

EXPOSE 8081
CMD ["/app/app"]
