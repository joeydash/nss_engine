# Accomox with docker


`docker exec -t <#CI> pg_dumpall -c -U postgres > dump_data.sql`

`cat dump_data.sql | docker exec -i <#CI> -id psql -U postgres`
