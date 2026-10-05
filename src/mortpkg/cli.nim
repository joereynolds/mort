## Command line parsing.
##
## This reproduces the slice of `commander` (v2) that mort relied on,
## including its argument normalisation: `-vv` counts verbosity twice,
## `-vf file` splits into `-v -f file`, `-u3` and `--usage-count=3` both
## supply a value, and `--` ends option parsing.

import std/[strutils, sequtils]

type
  Outcome* = enum
    runMort, showHelp, showVersion, parseFailed

  Options* = object
    usageCount*: int
    verbose*: int
    file*: string
    program*: string

  ParseResult* = object
    outcome*: Outcome
    options*: Options
    message*: string

const
  usageText* = "mort [options]"
  optionHelp* = [
    ("-V, --version", "output the version number"),
    ("-u, --usage-count <number>",
      "Show warnings for any css selector <= usage-count. (default: 0)"),
    ("-v, --verbose",
      "Detailed information about the matches will be displayed."),
    ("-f, --file <path>", "The css file to run mort against."),
    ("-p, --program <program>",
      "Force mort to use a grep program of your choice. Supported ones " &
      "are 'ripgrep', 'gitgrep', and 'grep'."),
    ("-h, --help", "output usage information"),
  ]

proc helpInformation*(): string =
  ## Laid out the way commander did: a two-space indented usage line, then
  ## the options indented four spaces with their descriptions aligned.
  let width = optionHelp.mapIt(it[0].len).max
  result = "\n  Usage: " & usageText & "\n\n  Options:\n\n"
  for (flags, description) in optionHelp:
    result.add "    " & flags.alignLeft(width + 2) & description & "\n"
  result.add "\n"

proc takesValue(flag: string): bool =
  flag in ["-u", "--usage-count", "-f", "--file", "-p", "--program"]

proc flagsFor(flag: string): string =
  for (flags, _) in optionHelp:
    if flag in flags.split(", "):
      return flags
  flag

proc normalize(args: openArray[string]): seq[string] =
  ## commander's `normalize`: expands clustered short flags and splits
  ## `--long=value` apart, leaving everything after `--` alone.
  var i = 0
  while i < args.len:
    let arg = args[i]
    if arg == "--":
      result.add args[i .. ^1]
      break
    elif i > 0 and takesValue(args[i - 1]):
      # The previous flag claimed this as its value; pass it through
      # untouched so a value like `-x` or `a=b` survives.
      result.add arg
    elif arg.len > 1 and arg[0] == '-' and arg[1] != '-':
      let short = "-" & arg[1]
      if arg.len > 2:
        if takesValue(short):
          result.add short            # -ffile => -f file
          result.add arg[2 .. ^1]
        else:
          for c in arg[1 .. ^1]:      # -vv => -v -v
            result.add "-" & c
      else:
        result.add arg
    elif arg.startsWith("--") and '=' in arg:
      let index = arg.find('=')
      result.add arg[0 ..< index]
      result.add arg[index + 1 .. ^1]
    else:
      result.add arg
    inc i

proc unknownOption(flag: string): ParseResult =
  ParseResult(outcome: parseFailed,
              message: "\n  error: unknown option `" & flag & "'\n")

proc missingArgument(flag: string): ParseResult =
  ParseResult(outcome: parseFailed,
              message: "\n  error: option `" & flagsFor(flag) &
                       "' argument missing\n")

proc parseArgs*(argv: openArray[string]): ParseResult =
  ## Parses mort's arguments. Positional arguments are accepted and ignored,
  ## just as they were before.
  result = ParseResult(outcome: runMort)
  let args = normalize(argv)

  var i = 0
  while i < args.len:
    let arg = args[i]

    if arg == "--":
      break

    if not (arg.len > 1 and arg[0] == '-'):
      inc i                           # a positional argument; mort ignores it
      continue

    var value = ""
    if takesValue(arg):
      if i + 1 >= args.len:
        return missingArgument(arg)
      value = args[i + 1]
      inc i

    case arg
    of "-V", "--version":
      return ParseResult(outcome: showVersion)
    of "-h", "--help":
      return ParseResult(outcome: showHelp)
    of "-v", "--verbose":
      inc result.options.verbose
    of "-f", "--file":
      result.options.file = value
    of "-p", "--program":
      result.options.program = value
    of "-u", "--usage-count":
      try:
        result.options.usageCount = parseInt(value.strip())
      except ValueError:
        return ParseResult(
          outcome: parseFailed,
          message: "\n  error: option `" & flagsFor(arg) &
                   "' expects a number, got `" & value & "'\n")
    else:
      return unknownOption(arg)

    inc i
