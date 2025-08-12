#!/bin/bash
base=$(cd `dirname $0`/.. && pwd)
app='daas'
mode=''
dist=$base/dist

usage() {
  echo "usage: deploy.sh [-p daas|dfs] [-o <path>] [-m <mode>]"
  exit 0
}

while getopts 'o:p:m:e:' OPT; do
  case $OPT in
  o) dist="$OPTARG" ;;
  p) app="$OPTARG" ;;
  m) mode="$OPTARG" ;;
  e) env="$OPTARG" ;;
  ?) usage ;;
  esac
done

sed -i.bak "s|DAAS_BUILD_NUMBER|$DAAS_BUILD_NUMBER|g" $base/apps/$app/.env

# 构建命令参数
build_cmd="pnpm build:$app"

echo "$build_cmd"

npm i -g corepack@latest

corepack enable

pnpm i

echo "node version: $(node --version)
corepack version: $(corepack --version)
pnpm version: $(pnpm --version)
Heap Statistics: $(node -e 'console.log(v8.getHeapStatistics())')"

eval $build_cmd
