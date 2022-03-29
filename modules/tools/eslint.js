// To not mix languages by mistake in naming!
const { eitherLatinOrCyrillicRegex } = require('./eslint-helpers')

module.exports = {
  root: true,
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'folders/match-regex': [2, eitherLatinOrCyrillicRegex, `${process.cwd()}/`],
    'filenames/match-regex': [2, eitherLatinOrCyrillicRegex],
  },
  plugins: ['folders', 'filenames'],
}
