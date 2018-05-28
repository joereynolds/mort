old_version=$(grep version package.json)

echo "This is the old versions number: $old_version"
echo "what version shall we bump it to?"

read new_version

echo "Bumping to $new_version..."

sed -i "s/\"version\":.*/\"version\": \"$new_version\",/" package.json
sed -i "s/const version.*/const version = \"$new_version\";/" src/main.ts 

npm run build

git add .
git commit

commit_id=$(git log | head -n1 | awk '{print $2}')

git tag -a v$new_version $commit_id

git push origin v$new_version
git push origin master
npm publish
