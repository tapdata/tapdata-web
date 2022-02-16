#!/usr/bin/env bash
# 当发生错误时中止脚本
#set -e

DAAS_HOME=$(cd "$(dirname "$0")" && pwd)

echo $DAAS_HOME

cd $DAAS_HOME

HOST="126,185"

usage() {
  echo "Usage:"
  echo "  deploy.sh [-h host]"
  echo ""
  echo "Description:"
  echo "    -h host: 你要发布到的主机，如126、185"
  echo ""
  echo "Example:"
  echo "    发布到126和185（默认）:                               ./deploy.sh"
  echo "    发布到126:                                          ./deploy.sh -h 126"
  echo ""
  exit 0
}

while getopts 'h:' OPT; do
  case $OPT in
  h) HOST="$OPTARG" ;;
  ?) usage ;;
  esac
done

HOST_ARR=(`echo $HOST | tr ',' ' '`)

pnpm i -w && pnpm build

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
  notice "开始上传前端包到$1"

  server="root@192.168.1.$1"
  path="/data/refactor-enterprise/tapdata-v1.25.2/components/tapdata-management/client"

  scp $fileName $server:$path || {
    notice "上传失败"
    exit 1
  }

  ssh ${server} "cd ${path}; find . -maxdepth 1 | grep -v '\(old\|${fileName}\)' | xargs rm -rf; unzip -o ${fileName}" || {
    notice "执行脚本出错，停止发布"
    exit 1
  }

  rm -rf $fileName

  notice "$1发布完成"
}

zip -q -r $fileName * -x \*.zip

for h in ${HOST_ARR[@]}
do
  work $h
done
