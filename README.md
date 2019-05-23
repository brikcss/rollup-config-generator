# Rollup Config Generator

<!-- Shields. -->
<p>
    <!-- NPM version. -->
    <a href="https://www.npmjs.com/package/@brikcss/rollup-config-generator"><img alt="NPM version" src="https://img.shields.io/npm/v/@brikcss/rollup-config-generator.svg?style=flat-square"></a>
    <!-- NPM tag version. -->
    <a href="https://www.npmjs.com/package/@brikcss/rollup-config-generator"><img alt="NPM version" src="https://img.shields.io/npm/v/@brikcss/rollup-config-generator/next.svg?style=flat-square"></a>
    <!-- NPM downloads/month. -->
    <a href="https://www.npmjs.com/package/@brikcss/rollup-config-generator"><img alt="NPM downloads per month" src="https://img.shields.io/npm/dm/@brikcss/rollup-config-generator.svg?style=flat-square"></a>
    <!-- Travis branch. -->
    <a href="https://github.com/brikcss/rollup-config-generator/tree/master"><img alt="Travis branch" src="https://img.shields.io/travis/rust-lang/rust/master.svg?style=flat-square&label=master"></a>
    <!-- Codacy. -->
    <a href="https://www.codacy.com"><img alt="Codacy code quality" src="https://img.shields.io/codacy/grade/fd3fd8097cd4495bb3a4a8153fad480d/master.svg?style=flat-square"></a>
    <a href="https://www.codacy.com"><img alt="Codacy code coverage" src="https://img.shields.io/codacy/coverage/fd3fd8097cd4495bb3a4a8153fad480d/master.svg?style=flat-square"></a>
    <!-- Coveralls -->
    <a href='https://coveralls.io/github/brikcss/rollup-config-generator?branch=master'><img src='https://img.shields.io/coveralls/github/brikcss/rollup-config-generator/master.svg?style=flat-square' alt='Coverage Status' /></a>
    <!-- JS Standard style. -->
    <a href="https://standardjs.com"><img alt="JavaScript Style Guide" src="https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square"></a>
    <!-- Prettier code style. -->
    <a href="https://prettier.io/"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"></a>
    <!-- Semantic release. -->
    <!-- <a href="https://github.com/semantic-release/semantic-release"><img alt="semantic release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square"></a> -->
    <!-- Commitizen friendly. -->
    <a href="http://commitizen.github.io/cz-cli/"><img alt="Commitizen friendly" src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square"></a>
    <!-- Greenkeeper. -->
    <a href="https://greenkeeper.io/"><img src="https://badges.greenkeeper.io/brikcss/rollup-config-generator.svg?style=flat-square" alt="Greenkeeper badge"></a>
    <!-- MIT License. -->
    <a href="LICENSE.md"><img alt="License" src="https://img.shields.io/npm/l/express.svg?style=flat-square"></a>
</p>

## About

<strong>⚠️ IMPORTANT: Brikcss follows semantic versioning. This package is currently at major version zero, which means <a href="https://semver.org/#spec-item-4" target="_blank">"anything may change at any time", and it "should not be considered stable"</a>.</strong>

Rollup config generator makes it easy to generate complex configurations for [RollupJS](https://rollupjs.org). It can generate multiple rollup configurations from a single simple object.

For example, this `.rolluprc.js` configuration:

```js
import configGen from "@brikcss/rollup-config-generator";
export default configGen.create(
    {
        id: "my-browser-library",
        type: "browser",
        input: "src/browser.js"
    },
    {
        id: "my-node-library",
        type: "node",
        input: "src/node.js"
    },
    {
        id: "my-app",
        type: "iife",
        input: "src/js/main.js"
    },
    {
        id: "my-one-off",
        target: "4",
        input: "src/one-off.js"
    }
);
```

does the following:

-   `type='browser'`: generates Vanilla JS/ES Modules, as well as Universal Modules (UMD), intended for use in the browser:

    -   `dist/esm/my-browser-library.js`: A Vanilla JS/ES module, not run through babel. Bundled version of the source code at `src/browser.js`.
    -   `dist/esm/my-browser-library.browser.js`: Browser modules do not automatically node modules (i.e., modules in the `node_modules` folder). This Browser Module build is the same as the Vanilla module, except that import paths are resolved so that a browser can understand it. This build supports any modern browser that supports native browser modules.
    -   `dist/umd/my-browser-library.js`: A Universal Module compiled with babel for modern browsers.
    -   `dist/umd/my-browser-library.legacy.js`: Universal Module compiled for legacy browsers.

-   `type='node'`: generates both Vanilla JS/ES and CommonJS/Node modules, intended for use in Node or CommonJS environments:

    -   `dist/esm/my-node-library.js`: A Vanilla JS/ES module bundle of the source code.
    -   `dist/cjs/my-node-library.js`: A CommonJS/Node module, compiled with babel to target Node 9+ (configurable).

-   `type='iife'`: generates IIFE (immediately invoked function execution) bundles for use in the browser:

    -   `dist/iife/my-app.js`: IIFE compiled for modern browsers.
    -   `dist/iife/my-app.legacy.js`: IIFE compiled for legacy browsers.

-   `target='4'` without the `type` compiles a single CommonJS/Node module for Node 4+. _Note: If no `type` property exists, a single rollup config is created. Use the `target` property to use Babel to target a specific environment, which can be `modern` (browser), `legacy` (browser), or a number (Node), which targets that version of Node and newer._

    -   `dist/cjs/my-one-off.js`: A CommonJS/Node module compiled for Node 4+.

_Look through [the tests](./test/generator.spec.js) for complete examples of how exactly `ConfigGen` generates rollup configurations._

### Including modern and legacy browser builds

To include scripts for both modern and legacy browsers, insert both scripts into your markup as follows:

```html
<script
    type="module"
    src="node_modules/<modulePath>/dist/umd/my-browser-library.js"
></script>
<script
    nomodule
    src="node_modules/<modulePath>/dist/umd/my-browser-library.legacy.js"
></script>
```

This takes advantage of native browser technologies to use the modern version if the browser supports modules, and the legacy version if it does not. Hopefully you're starting to see the power of how this works. Modern browsers get served a modern build, which is typically much smaller and more performant than the legacy build, while legacy browsers can still be easily supported.

## Contributing 🙏

We ❤️❤️❤️ contributions of any kind, whether it's bug reports, questions or feature requests, pull requests, and especially spreading some love about this project to your friends and co-workers!

**[Read our contributing guidelines](./CONTRIBUTING.md) and get involved to support this project.**

## Environment support

| Node | CLI | Browser | UMD | ES Module |
| :--: | :-: | :-----: | :-: | :-------: |
|  ✅  | ❌  |   ❌    | ✅  |    ❌     |

## Install 📦

```bash
npm install -D @brikcss/rollup-config-generator
```

## Quick Start 🏁

Get up and running in less than five minutes:

1.  Create a new generator in your rollup config file:

    Create new generator with all defaults:

    ```js
    import configGen from "@brikcss/rollup-config-generator";
    ```

    Or Create a custom generator:

    ```js
    import { ConfigGen } from "@brikcss/rollup-config-generator";
    const configGen = new ConfigGen({ base, sets, options, on });
    ```

2.  [Create the configuration](#generate-configs) and export it from your rollup config:

    ```js
    export default configGen.create(userConfig, globals);
    ```

## API 🤖

_Note: ConfigGen contains many methods which are not documented here. [Check out the source code](./src/rollup-config-generator.js) to see what else is available._

### Generate configs

```js
const rollupConfigs = ConfigGen.create(userConfigs, globals);
```

-   **`userConfigs`** \{object[]\} _(required)_ Array of user config objects. Each config object can contain any of [Rollup's configuration options](https://rollupjs.org/guide/en/#big-list-of-options), as well as the following:

    -   **`id`** \{string\} If ConfigGen cannot find a filepath from package.json that can be used, the `id` is used to help generate the `output.file` (if not already set).
    -   **`type`** \{string\} If this is set, ConfigGen will create a "set" of rollup configs by looking up `ConfigGen.sets[type]` and merging with the base and default config settings. By default, `type` can be `browser`, `dependency`, or `node`, though custom sets can be created. See [creating a custom generator](#create-a-custom-generator).
    -   **`target`** \{string\} If target is set, Babel will be set up to compile the bundle for the specified environment. Possible values are: `modern` (modern browsers), `legacy` (legacy browsers), or a number (e.g., `9`) which determines the minimum node version to target.

-   **`globals`** \{object\} When a rollup config is compiled, if a property in globals matches `${output.format}` or `${output.format}:${config.modern}`, that object is merged with the rest of the rollup config. For example: `globals.esm` will be merged with all rollup configs where `output.format` is `esm`. Likewise, `globals['esm:modern']` will merge with all rollup configs where `output.format` is `esm` AND where `config.target` is `modern`.

### Create a custom generator

```js
const configGen = new ConfigGen({ base, sets, options, on });
```

-   **`base`** \{object\} Base configuration. This gets merged with every rollup config that gets created. See [source code](./src/rollup-config-generator.js) for default values.
-   **`sets`** \{object\} Configuration sets. This allows you to create multiple rollup configs with a single user config object. In a user config object, if the `type` property exists, configs will be generated for each object in a set. The default sets are:

    -   `browser`: Creates a source ESM build, as well as separate ESM and UMD builds which target both modern and legacy browsers. This should be used for modules that are intended for use in the browser.
    -   `dependency`: Browser dependency builds. Since browsers do not resolve node module imports, this prebundles browser dependencies as ESM (modern only) and UMD (modern and legacy) builds. This can be used for any production dependencies you wish to provide prebundled.
    -   `node`: Node builds. This generates builds intended for use in a CommonJS/Node environment.

-   **`options`** \{object\} Configuration options:

    -   **`options.outputDir`** \{string\} _[dist]_ Output directory.
    -   **`options.pkgMap`** \{object\} For each user config, ConfigGen checks `${output.format}` and `${output.format}:${config.type}` in package.json. If the field exists, that filepath is used for output.file.

-   **`on`** \{object\} Map of the following hooks/callbacks:

    -   **`prependPlugins`** \{function\} `(config) => newPlugins` Prepends plugins to `config.plugins`.
    -   **`insertPlugins`** \{function\} `(config) => newPlugins` Inserts plugins to `config.plugins`.
    -   **`appendPlugins`** \{function\} `(config) => newPlugins` Appends plugins to `config.plugins`.
    -   **`output`** \{function\} `(output, config) => output` Modifies `config.output`.

## License 📃

[See License](LICENSE.md).
