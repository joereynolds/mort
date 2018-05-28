old_version=$(grep version package.json)

echo "This is the old versions number: $old_version"
echo "what version shall we bump it to? (Just the number i.e. 2.3.5)"

read new_version

echo "Bumping to $new_version..."

sed -i "s/\"version\":.*/\"version\": \"$new_version\",/" package.json
sed -i "s/const version.*/const version = \"$new_version\";/" src/main.ts 

npm run build

git add .
git commit

commit_id=$(git log | head -n1 | awk '{print $2}')

git tag -a v$new_version $commit_id

echo "Once you're certain about your changes, run these commands:"

echo "git push origin v$new_version"
echo "git push origin master"
echo "npm publish"
