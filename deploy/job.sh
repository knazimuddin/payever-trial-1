#!/usr/bin/env bash
set -e

npm run probe-mongo
npm run migrations up
