#!/bin/bash

docker pull postgres
docker run --name pgdb -e POSTGRES_PASSWORD=development -p 5432:5432 -d postgres
docker exec -it pgdb psql -U postgres -c "CREATE DATABASE seminare;"

gp ports await 5432

bun run db:push
bun run prisma/seed.ts
