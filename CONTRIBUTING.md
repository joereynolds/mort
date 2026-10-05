# Building and testing

`mort` is written in [Nim](https://nim-lang.org) and needs 1.6 or newer.

```
nimble build -d:release   # builds ./mort
nimble test               # builds ./mort, then runs every test
nimble unit               # only the tests that don't need the binary
```

The integration tests drive the built binary, so `nimble test` builds it
first. They also shell out to `rg`, `git grep` and `grep`, so all three need
to be on `PATH`.

Note that the test fixtures live in the same repository mort scans, so a
test that asserts a selector is *unused* will start failing if that selector
name is ever written into the source. Prefer `-u 100000` (which reports
every selector regardless of usage) when asserting on output format.

# How the search works

`src/mortpkg/selectors.nim` runs a single grep covering every selector, then
attributes each matching line back to the selectors it contains using the
Aho-Corasick automaton in `src/mortpkg/multimatch.nim`.

A grep backend (`src/mortpkg/grep_programs/`) supplies two commands:

- `batchArgv` is the one that runs: `-F -H --null -f <patterns>`, so output
  arrives as unambiguous `path\0line` records.
- `singleArgv` is the equivalent search for one selector, reported by `-vv`
  so a finding can be checked by hand.

If you add a backend, both need `-F` (literal patterns), `-H` (always print
the filename, so a single-file search path still yields a path) and NUL
separation, or attribution will silently mis-count.

`tests/tmultimatch.nim` cross-checks the automaton against naive substring
search on randomised input; keep that passing if you touch it.
`tests/tselectors.nim` asserts that batching gives the same answer as
searching one selector at a time, across all three backends.

# Making a release

`mort` follows semver so bump the version accordingly.

`./build.sh` walks through the whole thing, or by hand:
- Bump the version number in mort.nimble
- Bump the version number in src/mort.nim
- `nimble test`
- Create the commit if you're happy with it.
- Tag the commit

```
git tag -a vx.x.x some_commit_id
```

Once all that's done, remember to push it to the tag:

```
git push origin <tag_name>
```

and to the master branch too
```
git push
```

Then build the release binaries and attach them to the GitHub release.

# Useful CSS References

https://drafts.csswg.org/selectors-3/#id-selectors

https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
