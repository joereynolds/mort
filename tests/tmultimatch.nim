## The matcher is cross-checked against naive substring search, which is the
## behaviour it is meant to accelerate.

import std/[unittest, strutils, random, sequtils, algorithm]
import mortpkg/multimatch

proc find(patterns: openArray[string], text: string): seq[int] =
  let matcher = initMatcher(patterns)
  var hits: seq[int32]
  var seen = newSeq[bool](matcher.patternCount)
  matcher.findIn(text.toOpenArray(0, text.high), hits, seen)
  # `seen` must be left clean for reuse.
  check not seen.anyIt(it)
  hits.mapIt(it.int)

proc naive(patterns: openArray[string], text: string): seq[int] =
  let lowered = text.toLowerAscii()
  for id, pattern in patterns:
    if pattern.len == 0 or pattern.toLowerAscii() in lowered:
      result.add id

suite "Matcher":

  test "it finds a single pattern":
    check find(["abc"], "xxabcxx") == @[0]
    check find(["abc"], "xxabxx").len == 0

  test "it finds several patterns in one pass":
    check find(["a", "b", "c"], "cab").sorted() == @[0, 1, 2]

  test "it reports each pattern at most once per line":
    check find(["ab"], "ababab") == @[0]

  test "it finds overlapping patterns":
    # The whole point: `menu` must still be found inside `main-menu-item`.
    check find(["main-menu", "menu-item", "menu"], "x main-menu-item x").
      sorted() == @[0, 1, 2]

  test "it matches case-insensitively":
    check find(["AbC"], "xxabcxx") == @[0]
    check find(["abc"], "xxABCxx") == @[0]

  test "a pattern that is a suffix of another is still found":
    check find(["defgh", "gh"], "zdefghz").sorted() == @[0, 1]

  test "an empty pattern matches anything":
    check find([""], "whatever") == @[0]
    check find([""], "") == @[0]

  test "duplicate patterns each keep their own id":
    check find(["dup", "dup"], "a dup a").sorted() == @[0, 1]

  test "nothing matches an empty pattern set":
    check find([], "some text").len == 0

  test "it handles arbitrary bytes without blowing up":
    check find(["needle"], "\x00\x01needle\xff\xfe") == @[0]

  test "it agrees with naive substring search on random input":
    randomize(20251005)
    const alphabet = "abcAB-\x00\xff"
    for trial in 1 .. 400:
      var patterns: seq[string]
      for _ in 1 .. rand(1 .. 6):
        var pattern = ""
        for _ in 1 .. rand(0 .. 4):
          pattern.add alphabet[rand(alphabet.high)]
        patterns.add pattern
      var text = ""
      for _ in 1 .. rand(0 .. 40):
        text.add alphabet[rand(alphabet.high)]

      let expected = naive(patterns, text)
      let actual = find(patterns, text).sorted()
      checkpoint "patterns=" & $patterns & " text=" & escape(text)
      check actual == expected

  test "it agrees with naive search on realistic selector names":
    randomize(7)
    let patterns = @[
      "menu", "main-menu", "menu-item", "btn", "btn-primary", "a", "ab",
      "article", "article-tag", "hljs", "song", "text", "active",
    ]
    for trial in 1 .. 300:
      var text = ""
      for _ in 1 .. rand(0 .. 8):
        text.add patterns[rand(patterns.high)]
        text.add [" ", "-", "_", "\"", "", "<div class='"][rand(5)]
      check find(patterns, text).sorted() == naive(patterns, text)
