#!/bin/bash

FILE=$(realpath $1)

sqlite3 ./server/db/database.sqlite3 ".read $FILE"
