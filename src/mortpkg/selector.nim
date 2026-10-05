## A single CSS selector lifted out of a stylesheet.

import std/strutils

type Selector* = object
  rawName*: string
  cleanName*: string
  lineCount*: int
  lineNumber*: int

const
  idPrefix = '#'
  classPrefix = '.'

proc clean*(name: string): string =
  ## Strips `#`, `.`, `,`, a `{` together with any whitespace run leading
  ## directly into it, and `[attribute]` blocks.
  ##
  ## This is a hand-rolled port of the single global regex the TypeScript
  ## version used, `(#|\.|,|\s*\{|\[(\S*)\])`, so the alternation order and
  ## the greediness of `\S*` both still matter. Doing it by hand keeps mort
  ## free of a regex engine on the hot path.
  result = newStringOfCap(name.len)
  var i = 0
  while i < name.len:
    case name[i]
    of idPrefix, classPrefix, ',', '{':
      inc i
    of '[':
      # `\[(\S*)\]` is greedy, so it swallows everything up to the *last*
      # `]` in the run of non-whitespace following the `[`. With no `]` in
      # that run the alternative fails and the `[` is kept.
      var runEnd = i + 1
      while runEnd < name.len and name[runEnd] notin Whitespace:
        inc runEnd
      var closing = -1
      for j in countdown(runEnd - 1, i + 1):
        if name[j] == ']':
          closing = j
          break
      if closing >= 0:
        i = closing + 1
      else:
        result.add name[i]
        inc i
    of ' ', '\t', '\v', '\r', '\n', '\f':
      # `\s*\{` only matches when the whole whitespace run ends at a `{`;
      # otherwise the run is left alone.
      var runEnd = i
      while runEnd < name.len and name[runEnd] in Whitespace:
        inc runEnd
      if runEnd < name.len and name[runEnd] == '{':
        i = runEnd + 1
      else:
        result.add name[i ..< runEnd]
        i = runEnd
    else:
      result.add name[i]
      inc i

proc isValidId*(id: string): bool =
  ## Mirrors `^#[a-z|A-Z]+`. The `|` inside that character class was literal,
  ## so `#|foo` counted as a valid id and still does.
  id.len >= 2 and id[0] == idPrefix and
    (id[1] in {'a'..'z', 'A'..'Z'} or id[1] == '|')

proc initSelector*(rawName: string): Selector =
  Selector(
    rawName: rawName,
    cleanName: clean(rawName),
    lineCount: 0,
    lineNumber: 0,
  )

proc hasPseudoSelector*(self: Selector): bool =
  ## Mirrors `/(:+.*)/`, which amounts to "contains a colon".
  ':' in self.rawName

proc isIdOrClass*(self: Selector): bool =
  isValidId(self.rawName) or self.rawName.startsWith(classPrefix)

proc setLineCount*(self: var Selector, lineCount: int) =
  ## Set the highest count found for a selector.
  if lineCount > self.lineCount:
    self.lineCount = lineCount

proc setLineNumber*(self: var Selector, lineNumber: int) =
  self.lineNumber = lineNumber
