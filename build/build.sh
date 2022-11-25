#!/bin/bash

base=$(cd `dirname $0`/.. && pwd)
app='daas'
mode='production'
dist=$base/dist

usage() {
  echo "usage: deploy.sh [-p daas|dfs] [-o <path>] [-m <mode>]"
  exit 0
}

while getopts 'o:p:m:' OPT; do
  case $OPT in
  o) dist="$OPTARG" ;;
  p) app="$OPTARG" ;;
  m) mode="$OPTARG" ;;
  ?) usage ;;
  esac
done

sed -i.bak "s|DAAS_BUILD_NUMBER|$DAAS_BUILD_NUMBER|g" $base/apps/$app/.env

echo "pnpm build:$app --dest $dist --mode $mode"

pnpm i && pnpm build:$app --dest $dist --mode $mode
