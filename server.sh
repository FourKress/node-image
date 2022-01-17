#!/bin/bash

echo '---开始执行git pull---'
git pull
echo '---git pull执行完毕，开始执行yarn install---'
yarn
echo '---yarn install执行完毕，开始执行yarn build---'
yarn build
echo '---yarn build执行完毕 开始执行yarn pm2---'
yarn pm2
echo '---yarn pm2执行完毕 服务启动成功---'
