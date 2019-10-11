// Временный апгрейд для версий < 1.6.0
const mapValues = require('lodash/mapValues')
const { updateToolConfig } = require('@csssr/e2e-tools/utils')
const packageName = require('../../package.json').name

function addRemoteField(browser, browserName) {
  return browserName.includes('remote') ? { ...browser, remote: true } : browser
}

function addCredentialsId(browser) {
  return browser.basicAuth
    ? { ...browser, basicAuth: { credentialsId: 'chromedriver', ...browser.basicAuth } }
    : browser
}

function upgradeRemoteBrowsersConfig() {
  updateToolConfig(packageName, config => {
    return {
      ...config,
      browsers: mapValues(config.browsers, (browser, browserName) => {
        return addRemoteField(addCredentialsId(browser), browserName)
      }),
    }
  })
}

module.exports = { upgradeRemoteBrowsersConfig }
