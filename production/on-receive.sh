#!/bin/bash

cd /root/drawduel
git pull

source /root/.nvm/nvm.sh
$current_version=$(nvm current)
$target_version=$(<"/root/drawduel/.nvmrc")
if [ "$current_version" != "$target_version" ]; then
	nvm install "$desired_version"
	nvm alias default "$desired_version"
	rm -rf ./node_modules
fi
npm ci
npm run frontend:prod

cp ./production/drawduel.service /etc/systemd/system/drawduel.service
systemctl daemon-reload
systemctl restart drawduel
