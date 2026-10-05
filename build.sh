#!/usr/bin/env bash
# Cuts a release: bumps the version, builds, commits and tags.
set -euo pipefail

old_version=$(grep '^version' mort.nimble)

echo "Old version number: $old_version"
read -rp "Enter the new version number (i.e. 2.3.5): " new_version

echo "Bumping to $new_version in mort.nimble and src/mort.nim"
sed -i "s/^version .*/version       = \"$new_version\"/" mort.nimble
sed -i "s/^const version.*/const version = \"$new_version\"/" src/mort.nim

nimble test

git add .
git commit

commit_id=$(git rev-parse HEAD)

git tag -a "v$new_version" "$commit_id"

echo "Once you're certain about your changes, run these commands:"

echo "git push origin v$new_version"
echo "git push origin master"
