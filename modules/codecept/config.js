exports.config = {
  tests: './tests/**/*.test.js',
  output: './report',
  helpers: {
    Puppeteer: {
      url: 'http://localhost',
      show: true,
    },
  },
  bootstrap: null,
  mocha: {},
  name: 'e2e-tests',
  plugins: {
    pauseOnFail: {},
    retryFailedStep: {
      enabled: true,
    },
    tryTo: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
    },
  },
}
