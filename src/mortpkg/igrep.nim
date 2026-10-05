## The interface mort's grep backends implement.
##
## A backend builds two commands. `batchArgv` is the one mort actually runs:
## a single search for every selector at once, reading the selector names
## from a file and emitting `path\0line` records. `singleArgv` is the
## equivalent search for one selector, reported by `-vv` so a finding can be
## checked by hand.

type IGrep* = ref object of RootObj
  defaultSearchPath*: string
    ## Where the backend searches when `run` is not given a path.

method batchArgv*(self: IGrep, patternFile, path: string): seq[string] {.base.} =
  raise newException(CatchableError, "grep backend must implement `batchArgv`")

method singleArgv*(self: IGrep, selector, path: string): seq[string] {.base.} =
  raise newException(CatchableError, "grep backend must implement `singleArgv`")
