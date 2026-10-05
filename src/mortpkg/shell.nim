## Running a child process and capturing just its stdout.

import std/[osproc, streams]

proc capture*(argv: seq[string]): string =
  ## Runs `argv` and returns its stdout. stderr is discarded, matching the
  ## TypeScript version's `stdio: "pipe"` (which captured stderr separately
  ## and then ignored it) rather than letting it leak into the terminal.
  when defined(windows):
    let process = startProcess(
      argv[0], args = argv[1 .. ^1], options = {poUsePath})
    defer: process.close()
    result = process.outputStream.readAll()
    # Drain stderr so a chatty child can't fill its pipe and block.
    discard process.errorStream.readAll()
    discard process.waitForExit()
  else:
    # Handing the argv to `sh` as positional parameters keeps the shell away
    # from it entirely, so selectors never need quoting. `exec` avoids
    # leaving an extra `sh` in the process tree, and `2>/dev/null` means the
    # stderr pipe stays empty and cannot deadlock the stdout read.
    let process = startProcess(
      "/bin/sh",
      args = @["-c", """exec "$0" "$@" 2>/dev/null"""] & argv,
      options = {},
    )
    defer: process.close()
    result = process.outputStream.readAll()
    discard process.waitForExit()
