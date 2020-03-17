module.exports = {
  env: {
    mocha: true,
  },
  globals: {
    browser: true,
  },
  extends: [require.resolve('@csssr/mocha-testrail-ui/eslint')],
}
