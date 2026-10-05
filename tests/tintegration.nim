## Ported from the original test/integration/test.ts. These drive the built
## binary, so run them with `nimble integration` (or build `mort` first).

import std/[unittest, osproc, os, strutils, random, re]

const mort = "./mort"

proc shell(command: string): string =
  ## Runs `command` through a shell and returns stdout and stderr together.
  let (output, _) = execCmdEx(command)
  output

proc matches(output, pattern: string): bool =
  output.contains(re(pattern))

suite "mort (integration)":

  setup:
    require fileExists(mort)

  test "it uses stdin if no file is passed":
    # The selector has to be random, otherwise mort ironically finds it.
    randomize()
    let n = rand(100 .. 100_000)
    check shell("echo \"#something-" & $n & "\" | " & mort).
      matches(r"0 usages found")

  test "it displays the filename if verbose is 1 or higher":
    check shell(mort & " -v -f ./tests/fixtures/no-usages.css").
      matches(r"tests/fixtures/no-usages\.css")

  test "it displays line count if verbose is 1 or higher":
    check shell(mort & " -v -f ./tests/fixtures/no-usages.css").
      matches(r"\(.\slines\)")

  # `-u 100000` reports every selector, so these do not depend on whether
  # mort happens to find a selector elsewhere in its own repository.
  test "it displays the line number and count if verbose is 1 or higher":
    check shell(mort & " -v -u 100000 -f ./tests/fixtures/test.css").
      matches(r"\.a-valid-class:4 \(2 lines\)")

  test "it displays neither line number nor count without -v":
    let output = shell(mort & " -u 100000 -f ./tests/fixtures/test.css")
    check output.matches(r"\.a-valid-class can probably be removed")
    check not output.matches(r"\.a-valid-class:4")
    check not output.matches(r"lines\)")

  test "it warns if it can't find a file":
    check shell(mort & " -f non-existent-file-here").
      matches(r"Failed to open non-existent-file-here\. Does it exist\?")

  test "it finds selectors with ripgrep":
    check shell(mort & " -vv -f ./tests/fixtures/no-usages.css -p ripgrep").
      matches(r"Command used was: rg -i")

  test "it finds selectors with gitgrep":
    check shell(mort & " -vv -f ./tests/fixtures/no-usages.css -p gitgrep").
      matches(r"Command used was: git grep -i")

  test "it finds selectors with grep":
    check shell(mort & " -vv -f ./tests/fixtures/no-usages.css -p grep").
      matches(r"Command used was: grep -r -i")

  test "-u widens which selectors are reported":
    let output = shell(mort & " -u 100000 -f ./tests/fixtures/test.css")
    check output.matches(r"#a-valid-id")
    check output.matches(r"\.a-valid-class")

  test "it reports the version":
    check shell(mort & " --version").strip() == "1.5.0"

  test "it prints usage information":
    check shell(mort & " --help").matches(r"Usage: mort \[options\]")

  test "it rejects an unknown option":
    check shell(mort & " --nonsense").matches(r"unknown option")

  test "it says Done! when it finishes":
    check shell(mort & " -f ./tests/fixtures/test.css").matches(r"Done!")
