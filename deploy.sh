#!/usr/bin/env bash
# 当发生错误时中止脚本
#set -e

yarn && yarn build

cd dist

fileName="frontend-el-$(date +%y%m%d%H%M).zip"

command_exists () {
  command -v $1 >/dev/null 2>&1
}

notice() {
  if command_exists "say"; then
    say "$1"
  fi
}

work() {
  notice "打包成功，开始上传"

  server="root@192.168.1.126"
  path="/data/refactor-enterprise/tapdata-v1.25.2/components/tapdata-management/client"

  scp $fileName root@192.168.1.126:$path || {
    notice "上传失败"
    exit 1
  }

  ssh ${server} "cd ${path}; find . -maxdepth 1 | grep -v '\(old\|${fileName}\)' | xargs rm -rf; unzip -o ${fileName}" || {
    notice "执行脚本出错，停止发布"
    exit 1
  }
}

zip -q -r $fileName * -x \*.zip

work

notice "前端发布完成"
