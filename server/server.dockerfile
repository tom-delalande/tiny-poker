FROM golang:1.21 as build
WORKDIR /app

COPY . .
RUN go mod download
RUN go build -o /bin/app ./src/main.go

FROM ubuntu:latest
COPY --from=build /bin/app /bin/app

EXPOSE 9001
CMD ["/bin/app"]
