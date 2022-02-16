// To not mix languages by mistake in naming!
const eitherLatinOrCyrillicRegex = '^(([a-zA-Z0-9\-_ ]+)|([а-яА-ЯёЁ0-9\-_ ]+))(\.test)?$';

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
    ecmaVersion: 2018,
  },
  rules: {
    'folders/match-regex': [2, eitherLatinOrCyrillicRegex, `${process.cwd()}/`],
    'filenames/match-regex': [2, eitherLatinOrCyrillicRegex]
  },
  plugins: ['folders', 'filenames']
}
