## Extracting selectors from a stylesheet and counting their usages.

import std/[algorithm, sets, sequtils, strutils, tables, tempfiles, os]
import ./selector, ./printer, ./igrep, ./multimatch, ./shell

const separators = {'.', '#', '>'}

proc splitLines*(contents: string): seq[string] =
  ## Splits on `\r\n` or `\n`, so Windows-authored stylesheets behave the
  ## same as Unix ones. A trailing newline yields a trailing empty line,
  ## exactly as the `\r\n|\n` regex split did.
  var start = 0
  for i in 0 ..< contents.len:
    if contents[i] == '\n':
      let stop = if i > 0 and contents[i - 1] == '\r': i - 1 else: i
      result.add contents[start ..< stop]
      start = i + 1
  result.add contents[start ..< contents.len]

proc splitRetaining*(line: string): seq[string] =
  ## Splits a selector on `.`, `#`, `>` and whitespace runs, keeping each
  ## separator attached to the front of the piece it introduces, so
  ## `"#an-id .a-child"` becomes `@["#an-id", " ", ".a-child"]`.
  ##
  ## This is the `split-retain` package's `leadingSeparator` mode, including
  ## its habit of dropping the empty piece before a leading separator.
  var bounds: seq[(int, int)]
  var i = 0
  while i < line.len:
    if line[i] in separators:
      bounds.add (i, i + 1)
      inc i
    elif line[i] in Whitespace:
      let start = i
      while i < line.len and line[i] in Whitespace:
        inc i
      bounds.add (start, i)
    else:
      inc i

  if bounds.len == 0:
    return @[line]

  if bounds[0][0] > 0:
    result.add line[0 ..< bounds[0][0]]

  for index, (start, _) in bounds:
    let stop = if index + 1 < bounds.len: bounds[index + 1][0] else: line.len
    result.add line[start ..< stop]

proc getLineCountForSelector(lines: seq[string], index: int): int =
  ## How many lines the rule starting at `index` spans: walk forward until a
  ## `}` shows up. Returns 0 when the rule never closes, which leaves the
  ## selector's line count untouched (the TypeScript version returned
  ## `undefined` here and relied on the same no-op).
  for i in index ..< lines.len:
    if '}' in lines[i]:
      return i - index + 1
  0

proc getFrom*(lines: seq[string]): seq[Selector] =
  ## Returns the selectors from a given source.
  ##
  ## It only gets ids and classes, and child selectors are returned as
  ## separate items. So
  ##
  ##   "#a-valid-id .with-child"
  ##
  ## is broken down into
  ##
  ##   @["#a-valid-id", ".with-child"]
  ##
  ## Each selector is only ever returned once.
  var alreadyAdded = initHashSet[string]()

  for index, line in lines:
    if initSelector(line.strip()).isIdOrClass():
      for element in splitRetaining(line):
        var splitSelector = initSelector(element.strip())
        if splitSelector.isIdOrClass() and
            not splitSelector.hasPseudoSelector() and
            element notin alreadyAdded:
          splitSelector.setLineCount(getLineCountForSelector(lines, index))
          splitSelector.setLineNumber(index + 1)
          alreadyAdded.incl element
          result.add splitSelector

  result.sort do (a, b: Selector) -> int:
    cmp(a.rawName, b.rawName)

proc fromSource*(contents: string): seq[Selector] =
  getFrom(splitLines(contents))

proc fromFile*(file: string): seq[Selector] =
  fromSource(readFile(file))

proc fromStdin*(): seq[Selector] =
  fromSource(readAll(stdin))

proc searchOnce(grepProgram: IGrep, path: string, patterns: seq[string]):
    tuple[output: string, argv: seq[string]] =
  ## Runs a single search covering every selector at once. The patterns go
  ## through a file rather than the command line so that a stylesheet with
  ## thousands of selectors cannot overflow the argument limit.
  let (patternFile, patternPath) = createTempFile("mort_", ".patterns")
  try:
    try:
      for pattern in patterns:
        patternFile.writeLine pattern
    finally:
      patternFile.close()
    result.argv = grepProgram.batchArgv(patternPath, path)
    result.output = capture(result.argv)
  finally:
    removeFile patternPath

proc attribute(output: string, patterns: seq[string]):
    tuple[hitsPerPattern: seq[seq[int32]], paths: seq[string]] =
  ## Works out which selector each matching line belongs to.
  ##
  ## The grep programs emit one `path\0line` record per matching line. A
  ## record is scanned once for every selector it could contain, and the
  ## path is interned so a file matching many lines is only stored once.
  let matcher = initMatcher(patterns)
  result.hitsPerPattern = newSeq[seq[int32]](patterns.len)

  var pathIds = initTable[string, int32]()
  var hits: seq[int32]
  var seen = newSeq[bool](patterns.len)

  var start = 0
  while start <= output.high:
    var stop = output.find('\n', start)
    if stop < 0:
      stop = output.len
    if stop > start:
      let separator = output.find('\0', start, stop - 1)
      # A record with no path is not a match we can attribute to a
      # selector, such as grep's notice about a binary file.
      if separator >= 0:
        matcher.findIn(
          output.toOpenArray(separator + 1, stop - 1), hits, seen)
        if hits.len > 0:
          let path = output[start ..< separator]
          var pathId = pathIds.getOrDefault(path, -1'i32)
          if pathId < 0:
            pathId = result.paths.len.int32
            result.paths.add path
            pathIds[path] = pathId
          for id in hits:
            result.hitsPerPattern[id].add pathId
    start = stop + 1

proc findUsages*(grepProgram: IGrep, path: string, selectors: seq[Selector],
                 printer: Printer = nil): seq[Usage] =
  ## Looks every selector up and reports what was found for each.
  ##
  ## All the selectors are searched for in one go, so the cost is one grep
  ## process rather than one per selector.
  if selectors.len == 0:
    if printer != nil:
      printer.printDone()
    return

  let patterns = selectors.mapIt(it.cleanName)
  let search = searchOnce(grepProgram, path, patterns)

  if printer != nil:
    printer.printBatchCommand(search.argv.join(" "))

  let attributed = attribute(search.output, patterns)

  for index, selector in selectors:
    var foundIn = attributed.hitsPerPattern[index].mapIt(attributed.paths[it])
    sort(foundIn)

    let usage = Usage(
      selector: selector,
      usages: foundIn.len,
      foundIn: foundIn,
      commandUsed: grepProgram.singleArgv(selector.cleanName, path).join(" "),
    )
    result.add usage

    if printer != nil:
      printer.printUsage(usage)

  if printer != nil:
    printer.printDone()

proc run*(grepProgram: IGrep, cssFilePath: string, searchOnly: string,
          printer: Printer = nil): seq[Usage] =
  ## Scans `cssFilePath` (or stdin, when it is empty) against `searchOnly`.
  let cleanSelectors =
    if cssFilePath.len == 0: fromStdin() else: fromFile(cssFilePath)
  findUsages(grepProgram, searchOnly, cleanSelectors, printer)

proc run*(grepProgram: IGrep, cssFilePath: string): seq[Usage] =
  run(grepProgram, cssFilePath, grepProgram.defaultSearchPath)
