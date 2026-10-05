## `git grep` backend, used when ripgrep is not installed.

import ../igrep

type GitGrep* = ref object of IGrep

proc newGitGrep*(): GitGrep =
  GitGrep(defaultSearchPath: "")

method batchArgv*(self: GitGrep, patternFile, path: string): seq[string] =
  @["git", "grep", "-i", "-F", "-H", "--null", "-f", patternFile,
    "--", ":!*.css", ":!*.scss", path]

method singleArgv*(self: GitGrep, selector, path: string): seq[string] =
  @["git", "grep", "-i", "-F", "-e", selector,
    "--", ":!*.css", ":!*.scss", path]
