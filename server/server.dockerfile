FROM golang:1.21

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY src src
COPY db/migrations db/migrations
RUN go build -o app src/main.go

EXPOSE 6006

CMD ["./app"]
