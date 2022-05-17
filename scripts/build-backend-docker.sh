#!/bin/bash

set -euo pipefail

PROJECT=billboard-backend
VERSION=$(git rev-parse HEAD | head -c 7)
TAG=$PROJECT:git-$VERSION
TAR_PATH=build/$PROJECT-git-$VERSION.tar

docker build . -f backend.dockerfile -t $TAG
docker save --output $TAR_PATH $TAG
gzip $TAR_PATH
