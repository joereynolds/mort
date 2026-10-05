## mort - dead CSS detection.

import std/os
import mortpkg/[cli, igrep, printer, selectors]
import mortpkg/grep_programs/[gitgrep, grep, ripgrep]

const version = "1.5.0"

proc commandExists(command: string): bool =
  findExe(command).len > 0

proc main() =
  let parsed = parseArgs(commandLineParams())

  case parsed.outcome
  of showHelp:
    stdout.write helpInformation()
    quit(0)
  of showVersion:
    echo version
    quit(0)
  of parseFailed:
    stderr.write parsed.message
    quit(1)
  of runMort:
    discard

  let options = parsed.options

  # With no file, mort reads the stylesheet from stdin instead.
  let scanning = if options.file.len == 0: "stdin" else: options.file
  let printer = newPrinter(options.verbose, options.usageCount, scanning)

  var grepProgram: IGrep = newRipGrep()

  if not commandExists("rg"):
    printer.warnAboutNoRipgrep()
    grepProgram = newGitGrep()

  if not commandExists("rg") and not commandExists("git"):
    printer.warnAboutNoRipgrepAndNoGitgrep()
    grepProgram = newGrep()

  if options.program == "gitgrep":
    grepProgram = newGitGrep()

  if options.program == "grep":
    grepProgram = newGrep()

  if options.file.len > 0 and not fileExists(options.file):
    printer.warnAboutFileNotFound(options.file)
    quit(0)

  discard grepProgram.run(options.file, ".", printer)

when isMainModule:
  main()
