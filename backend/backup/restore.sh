#!/bin/bash

echo "Restoring MongoDB backup..."
docker exec mongo bash -c "mongorestore --drop --dir /data/dump/mongo-dump && mongod"
