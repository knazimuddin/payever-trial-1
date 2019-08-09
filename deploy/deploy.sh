#!/usr/bin/env bash
set -e
cp -R ./src/transactions/tools/fonts dist/src/transactions/tools
node dist/src/http.js
