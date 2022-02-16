module.exports = {
  env: {
    mocha: true,
  },
  globals: {
    browser: true,
  },
  ignorePatterns: ['**/report/'],
  extends: [require.resolve('@csssr/mocha-testrail-ui/eslint')],
}
