const fs = require('fs')
const path = require('path')
const packageName = require('../../../package.json').name
const glob = require('fast-glob')
const { getTestsRootDir, getConfig } = require('@csssr/e2e-tools/utils')

function clearFiles(filesPath) {
  const files = glob.sync(filesPath, {
    cwd: getTestsRootDir(),
  })

  files.forEach((filePath) => {
    fs.unlinkSync(filePath)
  })
}

function clearPreviousRunFiles() {
  clearFiles('codecept/report/allure-reports/*')

  const config = getConfig()
  const helpers = config.tools[packageName].helpers

  if (!helpers || !helpers.ResembleHelper) {
    return undefined
  }

  clearFiles(`${path.join('codecept', helpers.ResembleHelper.screenshotFolder)}*`)
  clearFiles(`${path.join('codecept', helpers.ResembleHelper.diffFolder)}*`)
}

module.exports = { clearPreviousRunFiles }
