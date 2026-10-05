## ripgrep backend. The default, because it is the quickest.

import ../igrep

type RipGrep* = ref object of IGrep

proc newRipGrep*(): RipGrep =
  RipGrep(defaultSearchPath: ".")

method batchArgv*(self: RipGrep, patternFile, path: string): seq[string] =
  @["rg", "-i", "-F", "-H", "--null", "-f", patternFile,
    "--iglob=!*.{css,scss}", path]

method singleArgv*(self: RipGrep, selector, path: string): seq[string] =
  @["rg", "-i", "-F", "--iglob=!*.{css,scss}", "-e", selector, path]
