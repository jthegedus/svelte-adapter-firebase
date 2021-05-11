#!/usr/bin/env bash
set -e

res=$(curl localhost:5000/ -o /dev/stderr -w "%{http_code}")

[ "$res" -eq 200 ]
