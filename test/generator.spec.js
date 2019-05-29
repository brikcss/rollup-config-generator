/* eslint-env jest */
const ConfigGen = require('../src/rollup-config-generator.js').ConfigGen
const configGen = require('../src/rollup-config-generator.js').default
const pkg = require('../package.json')

const isProd = ['production', 'test'].includes(process.env.NODE_ENV)

describe('rollup-config-generator()', () => {
  it('creates browser configs with globals', () => {
    expect.assertions(5)
    const config = configGen.create([
      {
        type: 'browser',
        input: 'src/webalias.js'
      }, {
        type: 'dependency',
        pkg: require('../node_modules/@babel/preset-env/package.json'),
        input: 'node_modules/@babel/preset-env/lib'
      }
    ], {
      umd (output, config) {
        output.exports = 'named'
        output.name = (config.pkg && config.pkg.name.includes('preset-env')) ? 'babel.preset' : 'brikcss.elements'
        output.globals = {
          '@brikcss/element': 'brikcss',
          hyperhtml: 'brikcss.html'
        }
        return output
      },
      'esm:modern': {
        paths: (id) => `./${id.includes('/') ? id.split('/')[1] : id}.js`
      }
    })

    const expected = [
      {
        input: 'src/webalias.js',
        output: {
          compact: isProd,
          sourcemap: !isProd,
          format: 'esm',
          banner: '/*! @brikcss/rollup-config-generator.js | @author Brikcss <https://github.com/brikcss> | @reference https://github.com/brikcss/rollup-config-generator */\n',
          file: 'dist/esm/rollup-config-generator.js'
        },
        plugins: [
          { name: 'terser' }
        ]
      }, {
        input: 'src/webalias.js',
        output: [
          {
            compact: isProd,
            sourcemap: !isProd,
            format: 'umd',
            file: 'dist/umd/rollup-config-generator.js',
            exports: 'named',
            name: 'brikcss.elements',
            globals: {
              '@brikcss/element': 'brikcss',
              hyperhtml: 'brikcss.html'
            },
            banner: '/*! @brikcss/rollup-config-generator.js | @author Brikcss <https://github.com/brikcss> | @reference https://github.com/brikcss/rollup-config-generator */\n'
          },
          {
            compact: isProd,
            sourcemap: !isProd,
            format: 'esm',
            file: 'dist/esm/rollup-config-generator.js'
          }
        ],
        plugins: [
          { name: 'node-resolve' },
          { name: 'commonjs' },
          { name: 'babel' },
          { name: 'terser' }
        ]
      }, {
        input: 'src/webalias.js',
        output: {
          compact: isProd,
          sourcemap: !isProd,
          format: 'umd',
          banner: '/*! @brikcss/rollup-config-generator.js | @author Brikcss <https://github.com/brikcss> | @reference https://github.com/brikcss/rollup-config-generator */\n',
          file: 'dist/umd/rollup-config-generator.legacy.js',
          exports: 'named',
          name: 'brikcss.elements',
          globals: {
            '@brikcss/element': 'brikcss',
            hyperhtml: 'brikcss.html'
          }
        },
        plugins: [
          { name: 'node-resolve' },
          { name: 'commonjs' },
          { name: 'babel' },
          { name: 'terser' }
        ]
      }, {
        input: 'node_modules/@babel/preset-env/lib',
        output: [
          {
            compact: isProd,
            sourcemap: !isProd,
            format: 'umd',
            file: 'dist/umd/preset-env.js',
            exports: 'named',
            name: 'babel.preset',
            globals: {
              '@brikcss/element': 'brikcss',
              hyperhtml: 'brikcss.html'
            }
          },
          {
            compact: isProd,
            sourcemap: !isProd,
            format: 'esm',
            file: 'dist/esm/preset-env.js'
          }
        ],
        plugins: [
          { name: 'node-resolve' },
          { name: 'commonjs' },
          { name: 'babel' },
          { name: 'terser' }
        ]
      },
      {
        input: 'node_modules/@babel/preset-env/lib',
        output: {
          compact: isProd,
          sourcemap: !isProd,
          format: 'umd',
          file: 'dist/umd/preset-env.legacy.js',
          exports: 'named',
          name: 'babel.preset',
          globals: {
            '@brikcss/element': 'brikcss',
            hyperhtml: 'brikcss.html'
          }
        },
        plugins: [
          { name: 'node-resolve' },
          { name: 'commonjs' },
          { name: 'babel' },
          { name: 'terser' }
        ]
      }
    ]
    config.forEach((c, i) => expect(c).toMatchObject(Object.assign({
      external: Object.keys(pkg.dependencies),
      watch: {
        chokidar: true,
        include: 'src/**',
        exclude: 'node_modules/**',
        clearScreen: true
      }
    }, expected[i])))
  })

  it('creates a cli config', () => {
    expect.assertions(1)
    const config = configGen.create([
      {
        type: 'cli',
        input: 'src/cli.js',
        output: { file: 'bin/my-cli.js' }
      }
    ])

    expect(config).toMatchObject({
      input: 'src/cli.js',
      output: {
        compact: isProd,
        sourcemap: !isProd,
        format: 'cjs',
        file: 'bin/my-cli.js'
      },
      plugins: [
        { name: 'node-resolve' },
        { name: 'commonjs' },
        { name: 'babel' },
        { name: 'terser' }
      ]
    })
  })

  it('creates a custom generator', () => {
    expect.assertions(2)
    const customGen = new ConfigGen({
      base: {
        input: 'testing.js',
        external: Object.keys(pkg.dependencies),
        watch: {
          chokidar: false
        }
      },
      sets: {
        custom: [{
          target: null,
          output: {
            format: 'cjs'
          }
        }]
      }
    })

    expect(customGen.base).toMatchObject({
      input: 'testing.js',
      external: Object.keys(pkg.dependencies),
      watch: {
        chokidar: false,
        include: 'src/**',
        exclude: 'node_modules/**',
        clearScreen: true
      },
      output: {
        compact: isProd,
        sourcemap: !isProd
      }
    })
    expect(customGen.sets).toMatchObject({
      browser: expect.any(Array),
      node: expect.any(Array),
      dependency: expect.any(Array),
      custom: [{
        target: null,
        output: {
          format: 'cjs'
        }
      }]
    })
  })

  it.skip('runs with output as a function', () => {})
})
