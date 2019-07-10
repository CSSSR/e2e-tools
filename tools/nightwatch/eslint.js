module.exports = {
  env: {
    mocha: true,
  },
  globals: {
    browser: true,
  },
  extends: [require.resolve('@nitive/mocha-testrail-ui/eslint')],
}
