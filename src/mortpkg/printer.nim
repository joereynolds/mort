## Terminal output for mort.

import std/[strformat, terminal, os]
import ./selector

type
  Usage* = object
    ## A selector together with where (and how often) it turned up.
    selector*: Selector
    usages*: int
    foundIn*: seq[string]
    commandUsed*: string

  Printer* = ref object
    verbose*: int
    userDefinedUsageCount*: int
    file*: string
    coloured: bool

const verboseMessage = "Running mort in verbose mode"

proc colourise(self: Printer, code, text, reset: string): string =
  if self.coloured: "\e[" & code & "m" & text & "\e[" & reset & "m" else: text

proc green(self: Printer, text: string): string = self.colourise("32", text, "39")
proc yellow(self: Printer, text: string): string = self.colourise("33", text, "39")
proc red(self: Printer, text: string): string = self.colourise("31", text, "39")
proc bgGreen(self: Printer, text: string): string = self.colourise("42", text, "49")

proc useColour(): bool =
  ## Follows the same rules `chalk` did: honour FORCE_COLOR / NO_COLOR, and
  ## otherwise only colourise when stdout is a terminal.
  if existsEnv("NO_COLOR"): return false
  if existsEnv("FORCE_COLOR"): return true
  isatty(stdout)

proc warn*(self: Printer, message: string) =
  echo self.red(message)

proc newPrinter*(verbose, userDefinedUsageCount: int, file: string): Printer =
  result = Printer(
    verbose: verbose,
    userDefinedUsageCount: userDefinedUsageCount,
    file: file,
    coloured: useColour(),
  )

  if result.verbose != 0:
    echo result.yellow(&"{verboseMessage} [Verbosity: {result.verbose}]")
    echo result.yellow(&"Scanning {result.file} ...")

proc printUsage*(self: Printer, usage: Usage) =
  ## Reports a selector when it was used no more than `--usage-count` times.
  let rawName = self.green(usage.selector.rawName)
  var usagesMessage =
    &"{usage.usages} usages found. {rawName} can probably be removed."

  if self.verbose >= 1:
    let lineCount = self.yellow(&"({usage.selector.lineCount} lines)")
    let lineNumber = self.yellow(&":{usage.selector.lineNumber}")
    usagesMessage = &"{usage.usages} usages found. " &
      &"{rawName}{lineNumber} {lineCount} can probably be removed."

  if self.verbose == 3:
    echo &"Searching for {self.green(usage.selector.rawName)}"

  if usage.usages <= self.userDefinedUsageCount:
    echo usagesMessage

    if self.verbose >= 2:
      if usage.foundIn.len <= self.userDefinedUsageCount:
        echo &"Command used was: {self.yellow(usage.commandUsed)}\n"

proc printDone*(self: Printer) =
  echo self.bgGreen("Done!")

proc warnAboutFileNotFound*(self: Printer, file: string) =
  self.warn(&"Failed to open {file}. Does it exist?")

proc warnAboutNoRipgrep*(self: Printer) =
  self.warn("rg (ripgrep) not found, falling back to 'git grep'")

proc warnAboutNoRipgrepAndNoGitgrep*(self: Printer) =
  self.warn("rg (ripgrep) not found, git grep not found, falling back to 'grep'")

proc printBatchCommand*(self: Printer, command: string) =
  ## At the highest verbosity, show the single search mort really ran. The
  ## per-selector command reported alongside each finding is the equivalent
  ## search for that one selector, which is the one worth re-running by hand.
  if self.verbose >= 3:
    echo &"Batched command was: {self.yellow(command)}"
