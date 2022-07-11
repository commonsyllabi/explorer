FROM golang:1.18-alpine AS go

RUN mkdir /app
COPY go.mod /app
COPY go.sum /app
WORKDIR /app
RUN go mod download

COPY cmd /app/cmd
COPY api /app/api

RUN go build -o bin/api ./cmd/api/main.go
CMD ["/app/bin/api"]