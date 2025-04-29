@echo off
echo Stop containers...
docker exec mongo bash /backup/backup.sh
docker-compose down
