#!/usr/bin/env bash
# 当发生错误时中止脚本
#set -e

yarn && yarn build

cd dist

fileName="frontend-el-$(date +%y%m%d%H%M).zip"

work() {
  say "开始上传应用包到126"
  server="root@192.168.1.126"
  path="/data/refactor-enterprise/tapdata-v1.25.2/components/tapdata-management/client"

  scp $fileName root@192.168.1.126:$path || {
    say "上传失败"
    exit 1
  }

  say "开始执行远程脚本"
  ssh ${server} "cd ${path}; find * | grep -v ${fileName} | xargs rm; unzip -o ${fileName}" || {
#  ssh ${server} "cd ${path}; unzip -o ${fileName}" || {
    say "执行脚本出错，停止发布"
    exit 1
  }
}

zip -q -r $fileName * -x \*.zip

work

say "发布完成"
