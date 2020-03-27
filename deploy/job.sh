#!/usr/bin/env bash
set -e

npm run probe-mongo
npm run migrations:prod up
npm run cli:prod rabbit:setup
