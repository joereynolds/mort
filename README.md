# Mort

Detects dead CSS.

![Build Status](https://travis-ci.org/joereynolds/mort.svg?branch=master)


![A demonstration of Mort](https://i.imgur.com/7qgUYpj.gif)

# Installing

```
npm i mort-css
```

Or globally with

```
npm i -g mort-css
```

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

Level 2 displays level 1 + The command used to find the selector

**Level 3**

`mort -f somefile.css -vvv`

Level 3 displays level 1 + level 2 and shows all selectors it is searching through (regardless of whether they are used or not).

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

**Note that this tool can't detect all use cases. For example, string-concatting a selector in JS will probably bypass the tool.**

# Troubleshooting

**There's no shell output in verbose mode.**

The "command used" doesn't display in Node 9.x.x. until a workaround is made, use 8.x.x.  

I recommend [nvm](https://github.com/creationix/nvm).

