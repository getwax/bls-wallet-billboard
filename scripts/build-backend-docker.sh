#!/bin/sh

set -euo pipefail

docker build . -f backend.dockerfile -t billboard-backend:git-$(git rev-parse HEAD | head -c 7)
