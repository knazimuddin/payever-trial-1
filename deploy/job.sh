#!/usr/bin/env bash
set -e

pe-probe-mongo
db-migrate up
