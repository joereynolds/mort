## Plain `grep` backend. The last resort; it is the slowest of the three.

import ../igrep

type Grep* = ref object of IGrep

proc newGrep*(): Grep =
  Grep(defaultSearchPath: ".")

method batchArgv*(self: Grep, patternFile, path: string): seq[string] =
  @["grep", "-r", "-i", "-F", "-H", "--null", "-f", patternFile,
    "--exclude=*.css", "--exclude=*.scss", path]

method singleArgv*(self: Grep, selector, path: string): seq[string] =
  @["grep", "-r", "-i", "-F", "--exclude=*.css", "--exclude=*.scss",
    "-e", selector, path]
