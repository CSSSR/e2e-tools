const path = require('path')
const { defaultOptions } = require('webdriver-image-comparison/build/helpers/options')
const { getElementsBySelectors } = require('./elements')

function getScreenshotFolder({ testsRootDir, testFileName }) {
  const parts = path.relative(testsRootDir, testFileName).split(path.sep)

  return parts
    .slice(0, -1)
    .concat(parts[parts.length - 1].split('.')[0])
    .join(path.sep)
}

exports.createOptions = async (client, browserName, testsRootDir, options = {}) => {
  const {
    hideSelectors = [],
    removeSelectors = [],
    allowedMisMatchPercentage = 0,
    ...opts
  } = options

  const screenshotFolder = getScreenshotFolder({
    testsRootDir,
    testFileName: client.currentTest.module,
  })

  const wic = defaultOptions({
    autoSaveBaseline: true,
    formatImageName: `${screenshotFolder}/{tag}/${browserName}-{width}x{height}`,
  })

  const method = {
    ...opts,
    hideElements: await getElementsBySelectors(client, hideSelectors),
    removeElements: await getElementsBySelectors(client, removeSelectors),
    returnAllCompareData: true,
  }

  return {
    options: { wic, method },
    allowedMisMatchPercentage,
  }
}
