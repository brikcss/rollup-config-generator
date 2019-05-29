/*! .rollup-config-generator.js | @author Brikcss (https://github.com/brikcss) | @reference (https://rollupjs.org) */

// -------------------------------------------------------------------------------------------------
// Imports and setup.
//

const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-terser').terser
const merge = require('@brikcss/merge')
const fs = require('fs-extra')
const path = require('path')

// Configuration helpers.
const isProd = ['production', 'test'].includes(process.env.NODE_ENV)

// -------------------------------------------------------------------------------------------------
// ConfigGen.
//

/**
 * ConfigGen constructor.
 *
 * @class ConfigGen
 * @param {Object} [config={}]  Configuration options.
 * @param {Function} [config.base={}]  Base rollup config for all configurations to be generated.
 * @param {Function} [config.sets={}]  Default "sets". A set creates multiple rollup configs from a
 *     single config that has the "type" property.
 */
function ConfigGen ({ base = {}, sets = {}, options = {}, on = {}, pkg } = {}) {
  this.pkg = pkg
  if (pkg === undefined) this.pkg = fs.readJsonSync(`${process.cwd()}/package.json`)
  this.pkgName = pkgName(this.pkg)

  this.base = merge({
    input: `src/${this.pkgName}.js`,
    external: this.pkg && this.pkg.dependencies ? Object.keys(this.pkg.dependencies) : [],
    watch: {
      chokidar: true,
      include: 'src/**',
      exclude: 'node_modules/**',
      clearScreen: true
    },
    output: {
      compact: isProd,
      sourcemap: !isProd
    }
  }, base)

  this.sets = merge({
    // Main browser module.
    browser: [
      {
        target: null,
        output: {
          format: 'esm'
        }
      }, {
        target: 'modern',
        output: [{
          format: 'umd'
        }, {
          format: 'esm'
        }]
      }, {
        target: 'legacy',
        output: {
          format: 'umd'
        }
      }
    ],
    // Prebundled browser dependency.
    dependency: [
      {
        target: 'modern',
        output: [{
          format: 'umd'
        }, {
          format: 'esm'
        }]
      }, {
        target: 'legacy',
        output: {
          format: 'umd'
        }
      }
    ],
    // Browser IIFE (immediately invoked function execution).
    iife: [
      {
        target: 'modern',
        output: {
          format: 'iife'
        }
      }, {
        target: 'legacy',
        output: {
          format: 'iife'
        }
      }
    ],
    // Node module.
    node: [
      {
        target: 'node',
        output: [
          {
            format: 'cjs'
          }, {
            format: 'esm'
          }
        ]
      }
    ],
    // Node CLI module.
    cli: [
      {
        target: 'node',
        output: {
          format: 'cjs',
          banner: '#!/usr/bin/env node'
        }
      }
    ]
  }, sets || {})

  this.on = on

  this.options = merge({
    outputDir: 'dist',
    pkgMap: {
      esm: 'module',
      'esm:modern': 'browser',
      cjs: 'main',
      umd: 'umd',
      cli: 'bin'
    }
  }, options)
}

// -------------------------------------------------------------------------------------------------
// ConfigGen prototype.
//

function pkgName (pkg) {
  if (pkg === undefined) pkg = this.pkg
  return pkg.name.includes('/') ? pkg.name.split('/')[1] : pkg.name
}

ConfigGen.prototype.createBanner = function createBanner (pkg, { keys = ['author', 'homepage:reference'] } = {}) {
  if (pkg === undefined) pkg = this.pkg
  let banner = `/*! ${pkg.name}.js`
  keys.forEach(key => {
    key = key.split(':')
    const name = key[1] || key[0]
    key = key[0]
    if (!pkg[key]) return
    banner += ` | @${name} ${pkg[key]}`
  })
  banner += ' */\n'
  return banner
}

/**
 * Create babel configuration based on target environment.
 *
 * @param {Array} target  Target environment for babel compile. Can be 'modern', 'legacy', or 'node'.
 * @return {Object}  Babel configuration object.
 */
ConfigGen.prototype.createBabelConfig = function createBabelConfig (target, babelConfig = {}) {
  if (!target) return undefined
  const browsers = {
    modern: ['Chrome >= 61', 'Firefox >= 60', 'Safari >= 10.1', 'Edge >= 16'],
    legacy: ['IE 11', 'Chrome < 61', 'Firefox < 60', 'Safari < 10.1', 'Edge < 16']
  }
  let babelPresetConfig = {
    targets: {
      node: !isNaN(target) ? target : '9',
      browsers: browsers.modern
    },
    useBuiltIns: false,
    loose: false,
    modules: 'auto',
    debug: false,
    include: [],
    exclude: []
  }
  babelConfig = merge({
    babelrc: false,
    presets: [['@babel/preset-env', babelPresetConfig]],
    plugins: [],
    include: [],
    exclude: [],
    runtimeHelpers: false
  }, babelConfig)

  // Determine babel targets.
  if (babelConfig) {
    if (target.includes('cjs')) {
      babelPresetConfig.targets.node = !isNaN(target) ? target : '9'
      // babelPresetConfig.modules = 'cjs'
    }
    if (target === 'legacy') {
      babelPresetConfig.targets.browsers = browsers.legacy
      // babelPresetConfig.modules = 'umd'
    } else if (target === 'modern') {
      babelPresetConfig.targets.browsers = browsers.modern
      // babelPresetConfig.modules = 'umd'
    }
    if (target.includes('esm')) {
      babelPresetConfig.targets.browsers = browsers.modern
      // babelPresetConfig.modules = false
    }
  }

  return babelConfig
}

/**
 * Create default set of rollup plugins.
 *
 * @param {String} target  Babel compile target.
 * @return {Array}  Array of rollup plugins.
 */
ConfigGen.prototype.createPlugins = function createPlugins (config, on = {}) {
  const self = this
  const isObject = Object.prototype.toString.call(config.plugins).slice(8, -1).toLowerCase() === 'object'
  let plugins = []

  // Prepend plugins at beginning.
  if (isObject && config.plugins.prepend) plugins = plugins.concat(config.plugins.prepend)
  if (typeof on.prependPlugins === 'function') plugins = plugins.concat(on.prependPlugins(config))
  // Add common plugins for all targets.
  if (config.target) plugins.push(resolve(), commonjs())
  // Insert plugins in the middle, after resolves but before babel.
  if (config.plugins instanceof Array) plugins = plugins.concat(config.plugins)
  if (isObject && config.plugins.insert) plugins = plugins.concat(config.plugins.insert)
  if (typeof on.insertPlugins === 'function') plugins = plugins.concat(on.insertPlugins(config))
  // Add babel.
  if (config.target) plugins.push(babel(self.createBabelConfig(config.target)))
  // Append plugins to end.
  if (isObject && config.plugins.append) plugins = plugins.concat(config.plugins.append)
  if (typeof on.appendPlugins === 'function') plugins = plugins.concat(on.appendPlugins(config))
  // Minimize in production.
  if (isProd) plugins.push(uglify())
  // Return the plugins.
  return plugins
}

/**
 * Creates rollup output from user configuration.
 *
 * @param {Object|[Object]} output  User output property.
 * @param {Object} config={}  Parnet configuration for given output.
 * @return {Object|[Object]}  Normalized rollup output.
 */
ConfigGen.prototype.createOutput = function createOutput (config, globals = {}) {
  const self = this
  if (config.pkg === undefined) config.pkg = self.pkg
  if (!(config.output instanceof Array)) config.output = [config.output]
  // Create default properties for each output.
  config.output = config.output.map(o => {
    // If config.output is a function, call it.
    if (typeof o === 'function') o(config)
    // Merge with defaults.
    o = merge({}, self.base.output, o)
    // Ensure format exists.
    if (!o.format) o.format = !isNaN(config.target) ? 'cjs' : 'esm'
    // Ensure file exists.
    if (!o.file) {
      // If it's the parent module, use fields from package.json.
      if (config.pkg && config.pkg[self.options.pkgMap[`${o.format}:${config.target}`] || self.options.pkgMap[o.format]]) {
        o.file = config.pkg[self.options.pkgMap[`${o.format}:${config.target}`] || self.options.pkgMap[o.format]]
      } else {
        o.file = `${self.options.outputDir ? `${self.options.outputDir}/` : ''}${o.format}/${(config.pkg && config.pkg.name) ? `${pkgName(config.pkg)}.js` : path.basename(config.input)}`
      }
    }
    // Add differentiation between same file names.
    if (config.target === 'legacy' && !o.file.includes('legacy')) {
      o.file = o.file.replace('.js', '.legacy.js').replace('.modern', '')
    }
    // If pkg exists, create a banner.
    if (!o.banner && config.pkg) {
      o.banner = self.createBanner(config.pkg)
    }
    // If globals[${format}] exists, merge it in.
    if (globals[o.format]) {
      o = merge(
        {},
        o,
        typeof globals[o.format] === 'function' ? globals[o.format](o, config) : globals[o.format]
      )
    }
    // If globals[`${format}:${target}`] exists, merge it in.
    if (globals[`${o.format}:${config.target}`]) {
      const targetOptions = globals[`${o.format}:${config.target}`]
      o = merge(
        {},
        o,
        typeof targetOptions === 'function' ? targetOptions(o, config) : targetOptions
      )
      o = merge({}, globals[o.format + ':' + config.target], o)
    }
    // Run on.output hook.
    if (typeof self.on.output === 'function') o = self.on.output(o, config)
    return o
  })
  // Return array if more than one output; otherwise return object.
  return config.output.length > 1 ? config.output : config.output[0]
}

/**
 * Create a single rollup config object.
 *
 * @param {Object} config  User configuration.
 * @return {Object}  Rollup config object.
 */
ConfigGen.prototype.createConfig = function createConfig (config, globals = {}) {
  const self = this
  // Merge config with base config.
  config = merge([
    { output: config.output, plugins: config.plugins },
    self.base,
    config
  ], { arrayStrategy: 'overwrite', ignore: ['output', 'plugins'] })

  // Create output(s).
  config.output = self.createOutput(config, globals)

  // Create plugins based on target(s).
  config.plugins = self.createPlugins(config)

  // Return the config.
  delete config.type
  delete config.target
  delete config.pkg
  return config
}

/**
 * Create multiple configs from one or more user configs.
 *
 * @param {Object|[Object]} configs  User configuration.
 * @param {Object} [globals={}]  Global configuration map, organized by output.format.
 * @return {Object|[Object]}  One or more configs.
 */
ConfigGen.prototype.create = function create (configs, globals = {}) {
  const self = this
  if (!(configs instanceof Array)) configs = [configs]
  configs = configs.reduce((result, config) => {
    // If this is for a set, create the set configs.
    if (config.type && self.sets[config.type]) {
      return result.concat(self.sets[config.type].map(set => {
        // If user config.output exists, we need to merge it with each set.output.
        const mergedConfig = merge([{ output: set.output }, set, config], { ignore: ['output', 'plugins'] })
        if (config.output) {
          if (!(mergedConfig.output instanceof Array)) mergedConfig.output = [mergedConfig.output]
          mergedConfig.output = mergedConfig.output.map(o => {
            return merge(o, config.output)
          })
          if (mergedConfig.output.length === 1) mergedConfig.output = mergedConfig.output[0]
        }
        // Create the config.
        return self.createConfig(mergedConfig, globals)
      }))
    }

    // Otherwise use this config.
    result.push(self.createConfig(config, globals))
    return result
  }, [])
  return configs.length > 1 ? configs : configs[0]
}

// -------------------------------------------------------------------------------------------------
// Exports.
//

module.exports.default = new ConfigGen()
module.exports.ConfigGen = ConfigGen
