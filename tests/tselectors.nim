## Ported from the original test/main.test.ts.

import std/[unittest, algorithm, sequtils]
import mortpkg/[selector, selectors, printer, igrep]
import mortpkg/grep_programs/[gitgrep, grep, ripgrep]

proc rawNames(found: seq[Selector]): seq[string] =
  found.mapIt(it.rawName)

proc sortedRawNames(found: seq[Selector]): seq[string] =
  result = rawNames(found)
  result.sort()

suite "Selectors":

  test "our grep program returns a sequence of results":
    let ripgrep = newRipGrep()
    check ripgrep.run("tests/fixtures/test.css").len > 0

  test "it only gets ids and classes":
    check sortedRawNames(fromFile("tests/fixtures/test.css")) ==
      @["#a-valid-id", ".a-valid-class"]

  test "it strips whitespace when it gets a selector":
    let input = @["#not-indented", "   .tab-indented", " #some-spaces"]
    check rawNames(getFrom(input)) ==
      @["#not-indented", "#some-spaces", ".tab-indented"]

  test "it does not return duplicate elements":
    let input = @["#a-test", "#a-test", "#a-test", ".some-class"]
    check rawNames(getFrom(input)) == @["#a-test", ".some-class"]

  test "it gets all selectors for a rule that are ids or classes":
    let input = @[
      "#my-id-right-here .a-child #and-another-id",
      ".class tr #something",
    ]
    check sortedRawNames(getFrom(input)) == @[
      "#and-another-id", "#my-id-right-here", "#something",
      ".a-child", ".class",
    ]

  test "it skips selectors with a pseudo selector":
    let found = rawNames(fromFile("tests/fixtures/pseudoselector.css"))
    check found == @["#a-valid-id"]

  # https://github.com/joereynolds/mort/issues/6
  test "it can handle unix and windows line endings":
    check sortedRawNames(fromFile("tests/fixtures/windows-line-endings.css")) ==
      @[".active", ".article", ".article-tag", ".hljs{", ".menu", ".song",
        ".text"]

  # https://github.com/joereynolds/mort/issues/8
  test "it searches chained selectors separately":
    let input = @[
      ".a-class.chained-with-another",
      "#an-id-chained.with-a-class",
      ".a-class-chained#with-an-id",
      "#these-are#both-ids",
    ]
    check sortedRawNames(getFrom(input)) == @[
      "#an-id-chained", "#both-ids", "#these-are", "#with-an-id",
      ".a-class", ".a-class-chained", ".chained-with-another",
      ".with-a-class",
    ]

  test "it correctly splits on >":
    let input = @[
      ".btn-group>",
      ".multiselect-container>li",
      ".multiselect-container>li>a",
      ".multiselect-container>li>a>label",
    ]
    check sortedRawNames(getFrom(input)) ==
      @[".btn-group", ".multiselect-container"]

  # https://github.com/joereynolds/mort/issues/48
  test "the length of selectors returned is correct":
    check splitLines(readFile("tests/fixtures/test.css")).len == 11

  test "it records the line number and line count of a rule":
    let input = @["#an-id {", "  color: red;", "}"]
    let found = getFrom(input)
    check found.len == 1
    check found[0].lineNumber == 1
    check found[0].lineCount == 3

  test "a rule that never closes leaves the line count at 0":
    let found = getFrom(@["#an-id {", "  color: red;"])
    check found.len == 1
    check found[0].lineCount == 0

suite "splitLines":

  test "it splits on both unix and windows line endings":
    check splitLines("a\nb\r\nc") == @["a", "b", "c"]

  test "a trailing newline yields a trailing empty line":
    check splitLines("a\n") == @["a", ""]

  test "an empty source is a single empty line":
    check splitLines("") == @[""]

suite "splitRetaining":

  test "each piece keeps the separator that introduced it":
    check splitRetaining("#an-id .a-child") == @["#an-id", " ", ".a-child"]
    check splitRetaining(".a.b") == @[".a", ".b"]
    check splitRetaining("li>a") == @["li", ">a"]
    check splitRetaining(".btn-group>") == @[".btn-group", ">"]
    check splitRetaining(".article + .article") ==
      @[".article", " +", " ", ".article"]
    check splitRetaining(".hljs{") == @[".hljs{"]
    check splitRetaining("") == @[""]
    check splitRetaining("}") == @["}"]

suite "findUsages":

  test "it reports findings for a used selector using ripgrep":
    let found = findUsages(
      newRipGrep(), "tests/fixtures", @[initSelector("#a-valid-id")])
    check found.len == 1
    check found[0].usages == 2
    check found[0].foundIn == @[
      "tests/fixtures/identical-to-test.html",
      "tests/fixtures/test.html",
    ]

  test "it reports findings for an unused selector using ripgrep":
    let found = findUsages(
      newRipGrep(), "tests/fixtures", @[initSelector(".a-valid-class")])
    check found.len == 1
    check found[0].usages == 0
    check found[0].foundIn.len == 0

  test "it reports findings for an unused selector using gitgrep":
    let found = findUsages(
      newGitGrep(), "tests/fixtures", @[initSelector(".a-valid-class")])
    check found.len == 1
    check found[0].usages == 0
    check found[0].foundIn.len == 0

  test "it reports the equivalent single-selector ripgrep command":
    # mort batches the real search, but reports the command that would find
    # this one selector, so a finding can be checked by hand.
    let found = findUsages(
      newRipGrep(), "tests/fixtures/no-usages.css",
      @[initSelector("#a-selector")])
    check found[0].commandUsed ==
      "rg -i -F --iglob=!*.{css,scss} -e a-selector tests/fixtures/no-usages.css"

  test "it reports the equivalent single-selector gitgrep command":
    let found = findUsages(
      newGitGrep(), "tests/fixtures", @[initSelector("#a-selector")])
    check found[0].commandUsed ==
      "git grep -i -F -e a-selector -- :!*.css :!*.scss tests/fixtures"

  test "it reports the equivalent single-selector grep command":
    let found = findUsages(
      newGrep(), "tests/fixtures", @[initSelector("#a-selector")])
    check found[0].commandUsed ==
      "grep -r -i -F --exclude=*.css --exclude=*.scss -e a-selector " &
      "tests/fixtures"

  test "no selectors means no search at all":
    check findUsages(newRipGrep(), "tests/fixtures", @[]).len == 0

suite "findUsages batches every selector into one search":

  const backends = ["ripgrep", "gitgrep", "grep"]

  proc backend(name: string): IGrep =
    case name
    of "ripgrep": newRipGrep()
    of "gitgrep": newGitGrep()
    else: newGrep()

  test "one search attributes each selector separately":
    # `#a-valid-id` is used twice, `another-valid-id` twice and
    # `.a-valid-class` not at all. Batched together, each must still get
    # its own count.
    for name in backends:
      let found = findUsages(backend(name), "tests/fixtures", @[
        initSelector("#a-valid-id"),
        initSelector(".a-valid-class"),
        initSelector("#another-valid-id"),
      ])
      checkpoint "backend=" & name
      check found.len == 3
      check found[0].selector.rawName == "#a-valid-id"
      check found[0].usages == 2
      check found[0].foundIn == @[
        "tests/fixtures/identical-to-test.html",
        "tests/fixtures/test.html",
      ]
      check found[1].usages == 0
      check found[1].foundIn.len == 0
      check found[2].usages == 2

  test "a selector that is a substring of another is counted separately":
    # Both occur on the same line, so attribution has to find overlapping
    # matches within a single record.
    for name in backends:
      let found = findUsages(backend(name), "tests/fixtures", @[
        initSelector("#a-valid-id"),
        initSelector("#valid"),
      ])
      checkpoint "backend=" & name
      check found[0].usages == 2
      # `valid` sits inside both `a-valid-id` and `another-valid-id`, on one
      # line in each of the two fixtures.
      check found[1].usages == 2

  test "batching gives the same answer as searching one at a time":
    for name in backends:
      let selectors = @[
        initSelector("#a-valid-id"),
        initSelector(".a-valid-class"),
        initSelector("#another-valid-id"),
        initSelector("#valid"),
        initSelector("#content"),
      ]
      let together = findUsages(backend(name), "tests/fixtures", selectors)
      var separately: seq[Usage]
      for selector in selectors:
        separately.add findUsages(
          backend(name), "tests/fixtures", @[selector])[0]

      checkpoint "backend=" & name
      check together.len == separately.len
      for i in 0 ..< together.len:
        check together[i].usages == separately[i].usages
        check together[i].foundIn == separately[i].foundIn
