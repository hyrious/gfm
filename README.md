## Preview GitHub Flavored Markdown

This repo provides a [site](https://hyrious.me/gfm), a cli tool,
a nodejs library and a deno library. Below is the library description.

### Install

```shell-session
# globally (as cli)
> npm i -g @hyrious/gfm
# locally (as library)
> npm i -D @hyrious/gfm
# deno see below
```

### Usage

As cli:

> Note: only one \*.md maybe passed to `gfm`, multiple files are ignored.

```shell-session
> gfm file.md
<p>content of this file</p>
> cat file.md | gfm
<p>content of this file</p>
# start a local server (like the site, with hot reloading enabled)
> gfm --serve file.md
# you may want to use a token to increase rate limit,
# simply append --token and it will ask for it before going.
> gfm file.md --token
Input Token (invisible): ******
<p>content of this file</p>
```

As library:

```js
import { render } from "@hyrious/gfm";
const rateLimit = {};
const html = await render("# markdown", { token, rateLimit });
console.log(rateLimit, html);
```

As deno library (you have to use it with `--allow-net`):

```ts
import { render } from "https://esm.run/@hyrious/gfm";
// same interface as nodejs library
```

As native browser module:

```html
<script type="module">
    import { render } from "https://esm.run/@hyrious/gfm";
</script>
```

As iife or umd (like jquery):

```html
<script src="https://cdn.jsdelivr.net/npm/@hyrious/gfm"></script>
<script>GFM.render("# hello").then(text => {})</script>
```

> Note: render results are not cached, you should implement caching on your own.

### Why

The library is written in .mjs to use vanilla `import` in nodejs (since 14).
It then uses rollup to convert mjs to cjs for `require` users.
It uses `browser`, `module` and conditional exports in package.json to support many platforms.
For the web site, it uses vite for development and bundling.

I personally made this package for a reference of the correct way
to support multiple environments in one package.
You (Me) should look at package.json for more details.

**package.json with comments**

```js
{
    // node's require and import, to override it, see "exports"
    "main": "dist/index.js",
    // https://nodejs.org/api/packages.html#packages_conditional_exports
    "exports": {
        "import": "./src/index.mjs",
        "require": "./dist/index.js"
    },
    // front-end bundler read this (like vite or webpack)
    "module": "src/index.browser.mjs",
    // cdn like jsdelivr read this
    "browser": "dist/index.browser.js"
}
```

### Licence

MIT @ [hyrious](https://github.com/hyrious)
