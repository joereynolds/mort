# Mort

Detects dead CSS.

[![Build Status](https://travis-ci.org/joereynolds/mort.svg?branch=master)]


![A demonstration of Mort](https://i.imgur.com/7qgUYpj.gif)

# Installing

There is no official package for mort yet, but you can do the following if you'd like to try it:

```
git clone https://github.com/joereynolds/mort
cd mort
npm install
npm run build
npm link
```

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

# Requirements

- One of either:
    - ripgrep
    - git grep
    - grep (Not recommended, very slow with mort)


**Note that this tool can't detect all use cases. For example, string-concatting a selector in JS will probably bypass the tool.**
