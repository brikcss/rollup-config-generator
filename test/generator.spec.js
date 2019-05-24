/* eslint-env jest */
const ConfigGen = require('../src/rollup-config-generator.js').ConfigGen
const configGen = require('../src/rollup-config-generator.js').default
const pkg = require('../package.json')

const isProd = ['production', 'test'].includes(process.env.NODE_ENV)

describe('rollup-config-generator()', () => {
  it('creates a complex config', () => {
    expect.assertions(7)
    const config = configGen.create([
      {
        type: 'browser',
        id: 'webalias',
        input: 'src/webalias.js',
        output: {
          banner: configGen.createBanner()
        }
      }, {
        type: 'dependency',
        id: 'hyperhtml',
        input: 'node_modules/hyperhtml/esm'
      }, {
        type: 'dependency',
        id: 'element',
        input: 'node_modules/@brikcss/element/dist/esm/brik-element.js'
      }
    ], {
      umd (output, config) {
        output.exports = 'named'
        output.name = config.id === 'hyperhtml' ? 'brikcss.html' : 'brikcss.elements'
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
          banner: '/*! @brikcss/rollup-config-generator | @author Brikcss <https://github.com/brikcss> | @reference (https://github.com/brikcss/rollup-config-generator) */\n',
          file: 'dist/esm/webalias.js'
        },
        plugins: [
          { name: 'terser' }
        ]
      },
      {
        input: 'src/webalias.js',
        output: [
          {
            compact: isProd,
            sourcemap: !isProd,
            format: 'umd',
            file: 'dist/umd/webalias.js',
            exports: 'named',
            name: 'brikcss.elements',
            globals: {
              '@brikcss/element': 'brikcss',
              hyperhtml: 'brikcss.html'
            }
          },
          {
            compact: isProd,
            sourcemap: !isProd,
            format: 'esm',
            file: 'dist/esm/webalias.js'
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
        input: 'src/webalias.js',
        output: {
          compact: isProd,
          sourcemap: !isProd,
          format: 'umd',
          banner: '/*! @brikcss/rollup-config-generator | @author Brikcss <https://github.com/brikcss> | @reference (https://github.com/brikcss/rollup-config-generator) */\n',
          file: 'dist/umd/webalias.legacy.js',
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
      },
      {
        input: 'node_modules/hyperhtml/esm',
        output: [
          {
            compact: isProd,
            sourcemap: !isProd,
            format: 'umd',
            file: 'dist/umd/hyperhtml.js',
            exports: 'named',
            name: 'brikcss.html',
            globals: {
              '@brikcss/element': 'brikcss',
              hyperhtml: 'brikcss.html'
            }
          },
          {
            compact: isProd,
            sourcemap: !isProd,
            format: 'esm',
            file: 'dist/esm/hyperhtml.js'
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
        input: 'node_modules/hyperhtml/esm',
        output: {
          compact: isProd,
          sourcemap: !isProd,
          format: 'umd',
          file: 'dist/umd/hyperhtml.legacy.js',
          exports: 'named',
          name: 'brikcss.html',
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
      },
      {
        input: 'node_modules/@brikcss/element/dist/esm/brik-element.js',
        output: [
          {
            compact: isProd,
            sourcemap: !isProd,
            format: 'umd',
            file: 'dist/umd/element.js',
            exports: 'named',
            name: 'brikcss.elements',
            globals: {
              '@brikcss/element': 'brikcss',
              hyperhtml: 'brikcss.html'
            }
          },
          {
            compact: isProd,
            sourcemap: !isProd,
            format: 'esm',
            file: 'dist/esm/element.js'
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
        input: 'node_modules/@brikcss/element/dist/esm/brik-element.js',
        output: {
          compact: isProd,
          sourcemap: !isProd,
          format: 'umd',
          file: 'dist/umd/element.legacy.js',
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
})
