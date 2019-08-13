#!/usr/bin/env bash
set -e
cp -R ./assets dist/assets
node dist/src/http.js
