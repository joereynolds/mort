## Ported from the original test/selector.test.ts, plus a table of cases
## pinned against the behaviour of the regexes the TypeScript version used.

import std/unittest
import mortpkg/selector

suite "Selector":

  test "it strips out `#` and `.` from selectors":
    check initSelector("#a-valid-id").cleanName == "a-valid-id"
    check initSelector(".a-valid-class").cleanName == "a-valid-class"

  test "it strips out attribute selectors":
    check initSelector("#a-valid-id[type=button]").cleanName == "a-valid-id"
    check initSelector(".a-valid-class[something]").cleanName == "a-valid-class"

  test "it is instantiated with a default line count of 0":
    check initSelector("#something").lineCount == 0

  test "it knows an invalid id when it sees one":
    for raw in ["#34", "#{animal}-type", "#", "", "#-dash", "no-hash"]:
      check not isValidId(raw)

  test "it knows a valid id when it sees one":
    for raw in ["#some-id", "#UPPER", "#a"]:
      check isValidId(raw)

  test "a literal pipe counts as a valid id, as it always has":
    # `^#[a-z|A-Z]+` put `|` inside the character class.
    check isValidId("#|pipe")

  test "it strips punctuation from the selector":
    check initSelector("#id-with-comma,").cleanName == "id-with-comma"
    check initSelector(".class-with-comma,").cleanName == "class-with-comma"

  test "it knows a pseudo selector when it sees one":
    check initSelector("#a:hover").hasPseudoSelector()
    check initSelector(".b::before").hasPseudoSelector()
    check not initSelector(".plain").hasPseudoSelector()

  test "it knows an id or a class when it sees one":
    check initSelector("#an-id").isIdOrClass()
    check initSelector(".a-class").isIdOrClass()
    check not initSelector("main").isIdOrClass()
    check not initSelector("#34").isIdOrClass()

  test "setLineCount only ever raises the count":
    var selector = initSelector("#a")
    selector.setLineCount(5)
    check selector.lineCount == 5
    selector.setLineCount(2)
    check selector.lineCount == 5
    selector.setLineCount(0)
    check selector.lineCount == 5

  test "clean matches the regex it replaced":
    const cases = {
      "#a-valid-id": "a-valid-id",
      ".a-valid-class": "a-valid-class",
      "#a-valid-id[type=button]": "a-valid-id",
      ".a[b][c]": "a",            # `\S*` is greedy to the last `]`
      "[a]b]": "",
      "[a b]": "[a b]",           # `\S*` cannot cross whitespace
      "x[a": "x[a",               # an unclosed `[` is left alone
      "div[ data ]": "div[ data ]",
      "a[href=\"x y\"]": "a[href=\"x y\"]",
      ".hljs{": "hljs",
      "#a-valid-id {": "a-valid-id",
      "  x{": "  x",              # whitespace is only eaten next to a `{`
      "a  {b": "ab",
      "x\t{y": "xy",
      "  \t {": "",
      ".foo > .bar": "foo > bar",
      "#these-are#both-ids": "these-areboth-ids",
      "#{animal}-type": "animal}-type",
      "#a:hover": "a:hover",
      "}": "}",
      "   ": "   ",
      "": "",
    }
    for (input, expected) in cases:
      check clean(input) == expected
