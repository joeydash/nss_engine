# nss-engine with docker

```bash
docker exec -t $(docker ps | awk -v app="postgres" '$2 ~ app{print $1}') pg_dumpall -c -U postgres > dump_data.sql


cat dump_data.sql | docker exec -i $(docker ps | awk -v app="postgres" '$2 ~ app{print $1}') psql -U postgres
```
