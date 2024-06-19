#!/bin/bash

source /root/.nvm/nvm.sh
cd /root/drawduel
nvm use

# https://unix.stackexchange.com/a/196053
exec npm start
