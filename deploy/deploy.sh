#!/usr/bin/env sh

/usr/local/bin/npm run migrations up || exec $?
/usr/local/bin/npm run start