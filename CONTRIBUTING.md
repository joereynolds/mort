# Making a release

`mort` follows semver so bump the version accordingly.

Steps for making a release are:
- Bump the version number in package.json
- Bump the version number in main.ts
- `npm run build`
- Create the commit if you're happy with it.
- Tag the commit

```
git tag -a vx.x.x some_commit_id
```
