#!/bin/bash

base=$(cd `dirname $0`/.. && pwd)
app='daas'
dist=$base/dist

usage() {
  echo "usage: deploy.sh [-p daas|dfs] [-o <path>]"
  exit 0
}

while getopts 'o:p:' OPT; do
  case $OPT in
  o) dist="$OPTARG" ;;
  p) app="$OPTARG" ;;
  ?) usage ;;
  esac
done

sed -i.bak "s|DAAS_BUILD_NUMBER|$DAAS_BUILD_NUMBER|g" $base/apps/$app/src/main.js

pnpm i && pnpm build:$app --dest $dist
