const path = require('path')

function setupHooks() {
  before(function globalBeforeHook(browser, done) {
    global.browser = browser
    done()
  })

  beforeEach(function globalBeforeEach(browser, done) {
    const ctx = this

    // eslint-disable-next-line no-param-reassign
    browser.currentTest = {
      get name() {
        return ctx.test.title
      },
      module: ctx.test.file,
      group: path.dirname(ctx.test.file),
      mochaTestContext: this,
    }

    done()
  })
}

global.setupHooks = setupHooks
