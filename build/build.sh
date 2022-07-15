#!/bin/bash

app='daas'
dist=$(cd `dirname $0`/.. && pwd)/dist

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

pnpm i && pnpm build:$app --dest $dist
