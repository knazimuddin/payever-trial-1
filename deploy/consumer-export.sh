#!/usr/bin/env bash
set -e

npm run consume:prod -- --queue=async_events_transactions_export_micro
