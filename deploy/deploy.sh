#!/usr/bin/env sh
set -e

/usr/local/bin/npm run probe-mongo
/usr/local/bin/npm run migrations up
/usr/local/bin/npm run start
