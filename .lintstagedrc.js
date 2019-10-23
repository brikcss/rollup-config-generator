/*! .lintstagedrc.js | @author Brikcss (https://github.com/brikcss) | @reference (https://github.com/okonet/lint-staged) */

module.exports = {
  '*!(*.min).js': ['standard --fix', 'git add'],
  '*.json': ['prettier --parser json --write', 'git add'],
  '*.md': ['prettier --parser markdown --write', 'git add']
}
