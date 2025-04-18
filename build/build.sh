#!/bin/bash

base=$(cd `dirname $0`/.. && pwd)
app='daas'
mode='production'
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

echo "pnpm build:$app --dest $dist --mode $mode"

pnpm i

echo "pnpm version: "
pnpm --version

pnpm build:$app --mode $mode -- --env $env
