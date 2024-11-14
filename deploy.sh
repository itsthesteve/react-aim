#! /bin/bash

set -eu

ORG=its
PROJECT_NAME=react-aim
ENTRYPOINT=./server/main.ts

echo "Building client"

pushd client &> /dev/null
npm run build
popd &> /dev/null

if [[ $? != 0 ]]; then
  echo "Client build failed"
  exit 1
fi

echo "Deploying..."

# Set the global environment variable to "production" so the correct .env will be loaded.
# I could use the --env-file flag, but this seems safer.
ENV=production deployctl deploy --project=$PROJECT_NAME \
  --org=$ORG \
  --import-map=./server/link.json \
  --include=./client/dist \
  --include=./server \
  --exclude=./client/playwright* \
  --exclude=**/.git* \
  --exclude=**/.sqlite* \
  --entrypoint=$ENTRYPOINT
