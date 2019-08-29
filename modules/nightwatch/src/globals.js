/* eslint-disable global-require */
const { setupHooksInternal } = require('./setup-hooks')

global.runInTestcaseBody = () => {
  // хак для before/after хуков, реализован в mocha-testrail-ui
  // из-за багав Nightwatch обычные хуки не работают с mocha ранером
  setupHooksInternal()
}

module.exports = {}
