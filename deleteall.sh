#! /bin/bash
# Populate this with the old staging project IDs found via deployctl deployments list
declare -a arr=()

for id in "${arr[@]}"
do
   deployctl deployments delete $id
   sleep 1
done
