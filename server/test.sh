#! /bin/bash

for i in {1..1000}; do
  curl -I http://localhost:9000/debug/test;
done
