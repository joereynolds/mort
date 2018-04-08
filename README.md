# Mort (WIP)

Naively detects dead CSS.

# Usage

```
mort your-css-file.css
```

Simply `cd` to the root of the project you're interested in and run `mort your-css-file.css` to scan that css file against your codebase.

# Requirements

- ripgrep
(Support for other grep programs is coming)

**Note that this tool can't detect all use cases. For example, string-concatting a selector in JS will probably bypass the tool.**
