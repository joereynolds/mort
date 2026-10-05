## Finding which of many patterns occur in a line of text.
##
## mort used to run one grep per selector. It now runs one grep for every
## selector at once and works out afterwards which selector each matching
## line belongs to, which is what this module does: an Aho-Corasick
## automaton over all the selector names, so a line is scanned once no
## matter how many selectors there are.
##
## Matching is case-insensitive over ASCII, mirroring the `-i` passed to the
## grep programs. Non-ASCII letters are compared as-is; see the note in the
## README.

import std/[tables, deques, strutils]

type Matcher* = object
  goto: seq[Table[char, int32]]
  fail: seq[int32]
  outputLink: seq[int32]      ## nearest ancestor-by-suffix holding outputs
  outputs: seq[seq[int32]]    ## pattern ids ending at this node
  alwaysMatch: seq[int32]     ## ids of empty patterns, which match anything
  patterns: int

proc addNode(self: var Matcher): int32 =
  result = self.goto.len.int32
  self.goto.add initTable[char, int32]()
  self.fail.add 0'i32
  self.outputLink.add 0'i32
  self.outputs.add newSeq[int32]()

proc initMatcher*(patterns: openArray[string]): Matcher =
  ## Builds a matcher for `patterns`. Ids handed back by `findIn` are
  ## indices into `patterns`, and duplicate patterns each keep their own id.
  result.patterns = patterns.len
  discard result.addNode()    # the root

  for id, pattern in patterns:
    if pattern.len == 0:
      # grep treats an empty pattern as matching every line, so so do we.
      result.alwaysMatch.add id.int32
      continue
    var node = 0'i32
    for ch in pattern:
      let c = toLowerAscii(ch)
      let existing = result.goto[node].getOrDefault(c, -1'i32)
      node =
        if existing >= 0:
          existing
        else:
          let fresh = result.addNode()
          result.goto[node][c] = fresh
          fresh
    result.outputs[node].add id.int32

  # Breadth-first so a node's fail link is always resolved before its
  # children need it.
  var queue = initDeque[int32]()
  for _, child in result.goto[0]:
    queue.addLast child
  while queue.len > 0:
    let node = queue.popFirst()
    for c, child in result.goto[node]:
      var f = result.fail[node]
      while f != 0 and c notin result.goto[f]:
        f = result.fail[f]
      let candidate = result.goto[f].getOrDefault(c, 0'i32)
      result.fail[child] = if candidate != child: candidate else: 0'i32
      result.outputLink[child] =
        if result.outputs[result.fail[child]].len > 0: result.fail[child]
        else: result.outputLink[result.fail[child]]
      queue.addLast child

proc patternCount*(self: Matcher): int =
  self.patterns

proc findIn*(self: Matcher, text: openArray[char], hits: var seq[int32],
             seen: var seq[bool]) =
  ## Fills `hits` with the id of every pattern occurring in `text`, each id
  ## at most once, in the order first encountered.
  ##
  ## `seen` must have `patternCount` entries and be all false on the way in;
  ## it is left all false on the way out so it can be reused per line.
  hits.setLen 0

  for id in self.alwaysMatch:
    if not seen[id]:
      seen[id] = true
      hits.add id

  var node = 0'i32
  for ch in text:
    let c = toLowerAscii(ch)
    while node != 0 and c notin self.goto[node]:
      node = self.fail[node]
    node = self.goto[node].getOrDefault(c, 0'i32)

    var output = if self.outputs[node].len > 0: node else: self.outputLink[node]
    while output != 0:
      for id in self.outputs[output]:
        if not seen[id]:
          seen[id] = true
          hits.add id
      output = self.outputLink[output]

  for id in hits:
    seen[id] = false
