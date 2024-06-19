#!/bin/bash

WORKTREE=/root/drawduel

source /root/.nvm/nvm.sh
cd $WORKTREE
nvm use
export NODE_ENV=production

# https://unix.stackexchange.com/a/196053
exec $WORKTREE/node_modules/.bin/tsx --tsconfig tsconfig.backend.json $WORKTREE/src/backend/server.ts
