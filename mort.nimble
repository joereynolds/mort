version       = "1.5.0"
author        = "Joe Reynolds"
description   = "Dead CSS detection"
license       = "MIT"
srcDir        = "src"
bin           = @["mort"]

requires "nim >= 1.6.0"

import std/[os, algorithm]

proc testFiles(): seq[string] =
  ## Every tests/t*.nim, so a new test file is picked up without being
  ## listed here.
  for path in listFiles("tests"):
    let (_, name, ext) = splitFile(path)
    if ext == ".nim" and name.len > 1 and name[0] == 't':
      result.add path
  result.sort()

task test, "Build mort and run the whole test suite":
  # The integration tests drive the real binary, so build it first.
  exec "nimble build -d:release --verbose:off"
  for path in testFiles():
    exec "nim r --hints:off --path:" & srcDir & " " & path

task unit, "Run only the tests that do not need a built binary":
  for path in testFiles():
    if not path.endsWith("tintegration.nim"):
      exec "nim r --hints:off --path:" & srcDir & " " & path
