#!/bin/sh

command_exists () {
  command -v "$1" >/dev/null 2>&1
}

# 必要なコマンドの確認
if ! command_exists node ; then
  echo "node is not installed"
  exit 1
fi

if ! command_exists npm ; then
  echo "npm is not installed"
  exit 1
fi