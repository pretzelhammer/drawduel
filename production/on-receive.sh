#!/bin/bash

WORKTREE=/root/drawduel
cd $WORKTREE

source /root/.nvm/nvm.sh
current_version=$(nvm current)
target_version=$(<"$WORKTREE/.nvmrc")
if [ "$current_version" != "$target_version" ]; then
	nvm install "$target_version"
	nvm alias default "$target_version"
	rm -rf $WORKTREE/node_modules
fi
npm ci
npm run frontend:prod

cp $WORKTREE/production/drawduel.service /etc/systemd/system/drawduel.service
systemctl daemon-reload
systemctl restart drawduel
