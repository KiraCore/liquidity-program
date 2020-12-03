#!/bin/sh

echo "Publish START"

app_name="PriceOracle"
pub_dir=./bin/publish
current_dir=$PWD

rm -rf $pub_dir -f -r -v

dotnet publish -c Debug -r linux-x64 -o $pub_dir/linux-x64

cd $pub_dir/linux-x64/

zip -r ../$app_name-linux-x64.zip *

cd "$current_dir"

echo "Publish DONE"