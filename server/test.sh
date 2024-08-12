#! /bin/bash

for i in {1..50}; do
  curl -I http://localhost:9000/debug/test;
  echo "\n";
done
