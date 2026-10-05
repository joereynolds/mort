## Argument parsing, including the commander-isms mort's docs rely on.

import std/[unittest, strutils, sequtils]
import mortpkg/cli

proc opts(args: varargs[string]): Options =
  let parsed = parseArgs(@args)
  check parsed.outcome == runMort
  parsed.options

suite "parseArgs":

  test "it defaults to no verbosity, no file and a usage count of 0":
    let o = opts()
    check o.verbose == 0
    check o.usageCount == 0
    check o.file == ""
    check o.program == ""

  test "it reads the file from either flag form":
    check opts("-f", "a.css").file == "a.css"
    check opts("--file", "a.css").file == "a.css"
    check opts("--file=a.css").file == "a.css"

  test "repeating -v increases verbosity":
    check opts("-v").verbose == 1
    check opts("-v", "-v").verbose == 2
    check opts("--verbose", "--verbose").verbose == 2

  test "clustered short flags are expanded":
    check opts("-vv").verbose == 2
    check opts("-vvv").verbose == 3

  test "a cluster can end in a flag that takes a value":
    # `mort -vf some.css` is the form the README documents.
    let o = opts("-vf", "some.css")
    check o.verbose == 1
    check o.file == "some.css"

  test "it reads the usage count":
    check opts("-u", "3").usageCount == 3
    check opts("--usage-count", "3").usageCount == 3
    check opts("--usage-count=3").usageCount == 3
    check opts("-u3").usageCount == 3

  test "it reads the grep program":
    check opts("-p", "gitgrep").program == "gitgrep"
    check opts("--program=grep").program == "grep"

  test "a value is taken literally, even when it looks like a flag":
    check opts("-f", "-weird-name.css").file == "-weird-name.css"

  test "everything after -- is left alone":
    check opts("-v", "--", "-f", "nope.css").verbose == 1
    check opts("-v", "--", "-f", "nope.css").file == ""

  test "positional arguments are ignored":
    check opts("stray", "-v").verbose == 1

  test "it asks for help":
    check parseArgs(@["-h"]).outcome == showHelp
    check parseArgs(@["--help"]).outcome == showHelp

  test "it asks for the version":
    check parseArgs(@["-V"]).outcome == showVersion
    check parseArgs(@["--version"]).outcome == showVersion

  test "an unknown option is an error":
    let parsed = parseArgs(@["--nonsense"])
    check parsed.outcome == parseFailed
    check "unknown option `--nonsense'" in parsed.message

  test "a missing value is an error":
    let parsed = parseArgs(@["-f"])
    check parsed.outcome == parseFailed
    check "argument missing" in parsed.message
    check "-f, --file <path>" in parsed.message

  test "a non-numeric usage count is an error":
    let parsed = parseArgs(@["-u", "abc"])
    check parsed.outcome == parseFailed
    check "expects a number" in parsed.message

suite "helpInformation":

  test "it lists every option with its description aligned":
    let help = helpInformation()
    check "Usage: mort [options]" in help
    for (flags, description) in optionHelp:
      check ("    " & flags) in help
      check description in help

  test "the descriptions line up in a single column":
    var columns: seq[int]
    for line in helpInformation().splitLines():
      if line.startsWith("    -"):
        for (flags, description) in optionHelp:
          if line.contains(flags):
            columns.add line.find(description)
    check columns.len == optionHelp.len
    check columns.deduplicate().len == 1
