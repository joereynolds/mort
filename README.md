# Mort

Detects dead CSS.

![A demonstration of Mort](https://i.imgur.com/KcHogZC.gif?1)

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

```
mort your-css-file.css
```

Simply `cd` to the root of the project you're interested in and run `mort your-css-file.css` to scan that css file against your codebase.


# Requirements

- One of either:
    - ripgrep
    - git grep


**Note that this tool can't detect all use cases. For example, string-concatting a selector in JS will probably bypass the tool.**
