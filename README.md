# Mort

Detects dead CSS.

![Build Status](https://travis-ci.org/joereynolds/mort.svg?branch=master)


![A demonstration of Mort](https://i.imgur.com/7qgUYpj.gif)

# Installing

You can use the binaries on the [releases page](https://github.com/joereynolds/mort/releases) for versions 1.5 and above.

Or build it yourself. `mort` is written in [Nim](https://nim-lang.org), so
you'll need the Nim toolchain (1.6 or newer), then:

```
nimble install
```

To build from a checkout without installing:

```
nimble build -d:release
```

That leaves a `mort` binary in the project root.

You should then be able to run `mort`.

# Usage

`cd` to the root of the project you're interested in and run mort to scan that css file against your codebase.

**Normal use**
```
mort -f your-css-file.css
```

**Verbose output**
```
mort -f your-css-file.css -v
```

**Forcing use of `git grep`**
```
mort -f your-css-file.css -p gitgrep
```

**Stdin**

If no arguments are supplied, `mort` reads from stdin.

i.e.

```
cat my-css-file.css | mort
```
or
```
echo "#my-selector-to-hunt-for" | mort
```

**Multiple CSS files**

It's possible to scan multiple CSS files with `mort`.

```
ls assets/css/*.css | xargs -L1 mort -v -f 
```

Ignoring some files with `find`

```
find -iname *.scss -not -path "./node_modules/*" | xargs -L1 mort -vf
```

## Options

```
  Usage: mort [options]

  Options:

    -V, --version               output the version number
    -u, --usage-count <number>  Show warnings for any css selector <= usage-count. (default: 0)
    -v, --verbose               Detailed information about the matches will be displayed.
    -f, --file <path>           The css file to run mort against.
    -p, --program <program>     Force mort to use a grep program of your choice. Supported ones are 'ripgrep', 'gitgrep', and 'grep'.
    -h, --help                  output usage information
```

### -u --usage-count

This will show all selectors that are <= to the specified count.

i.e.

```
mort -f your-css-file.css -u 3
```

Will display all selectors that are used 3 times or less.
This is particularly useful to find selectors that can be combined into classes etc...

### -v --verbose

This toggles verbosity.
There are currently 3 levels of verbosity.

**Level 1**

`mort -f somefile.css -v`

Level 1 displays what file it is scanning and the line count for that selector.

**Level 2**

`mort -f somefile.css -vv`

Level 2 displays level 1 + the command that finds that selector.

`mort` searches for every selector in a single pass (see
[How mort searches](#how-mort-searches)), so the command shown is the
equivalent search for that one selector rather than the literal command run.
It is the one worth re-running by hand to check a finding.

**Level 3**

`mort -f somefile.css -vvv`

Level 3 displays level 1 + level 2, shows all selectors it is searching
through (regardless of whether they are used or not), and prints the single
batched command it actually ran.

### -f --file

The file to run `mort` against. If unspecified, `mort` will read from stdin.

### -p --program

Which grep program to use. The default is ripgrep as it's the quickest.
Supported grep programs are ripgrep, gitgrep, and grep.

Note that grep is incredibly slow so is not recommended

**Using the default (ripgrep)**

`mort -f somefile.css`

**Using git grep**

`mort -f somefile.css -p gitgrep`

**Using grep**

`mort -f somefile.css -p grep`

# Requirements

- One of either:
    - ripgrep
    - git grep
    - grep (Not recommended, very slow with mort)

To build from source you also need Nim 1.6 or newer.

# How mort searches

`mort` runs **one** search for the whole stylesheet, not one per selector.
It writes every selector name to a temporary file, hands that to the grep
program with `-f`, and asks for NUL-separated output so each matching line
arrives as `path\0line`. It then works out which selectors each line
contains using an [Aho-Corasick](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm)
automaton, so a line is scanned once no matter how many selectors there are.

This matters a lot on real stylesheets, because the old behaviour of one
grep process per selector cost a full walk of your codebase per selector:

| Selectors | One grep per selector | One grep total |
| --------- | --------------------- | -------------- |
| 100       | 3.1 s                 | 0.07 s         |
| 500       | 18.6 s                | 0.04 s         |
| 2000      | 73.1 s                | 0.14 s         |

(845-file tree; the batched time tracks the size of your codebase, not the
number of selectors.)

Two consequences worth knowing about:

- **Selectors are matched literally, not as regexes.** The grep programs are
  given `-F`. Previously a selector such as `.center()` was handed to grep as
  a pattern, so its `()` was an empty regex group and it matched every
  occurrence of `center`; `#|pipe` matched every line in the codebase, via
  the `|` alternation; and `.average(16px,` made ripgrep fail to parse its
  regex, which looked like "0 usages" because the error was discarded.
  Literal matching reports what you actually asked for. Plain CSS selectors
  are unaffected, since they contain no regex metacharacters.
- **Case-insensitive matching is ASCII-only** when deciding which selector a
  line belongs to. The grep programs still do their own `-i` matching, so
  nothing is over-reported; but a selector containing a non-ASCII letter that
  differs in case from its usage (`.Ümlaut` against `ümlaut`) would be
  missed. CSS identifiers are overwhelmingly ASCII, so this is unlikely to
  bite.

**Note that this tool can't detect all use cases. For example, string-concatting a selector in JS will probably bypass the tool.**
