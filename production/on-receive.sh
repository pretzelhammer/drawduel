#!/bin/bash

WORKTREE=/root/drawduel
GIT_DIR=/root/drawduel.git

pwd
cd $WORKTREE
pwd
git --work-tree=$WORKTREE --git-dir=$GIT_DIR checkout --force main
pwd

# test 2

source /root/.nvm/nvm.sh
current_version=$(nvm current)
target_version=$(<"/root/drawduel/.nvmrc")
if [ "$current_version" != "$target_version" ]; then
	nvm install "$desired_version"
	nvm alias default "$desired_version"
	rm -rf $WORKTREE/node_modules
fi
npm ci
npm run frontend:prod

pwd
cp $WORKTREE/production/drawduel.service /etc/systemd/system/drawduel.service
systemctl daemon-reload
systemctl restart drawduel
