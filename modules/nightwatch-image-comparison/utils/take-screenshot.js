const path = require('path')
const addContext = require('mochawesome/addContext')
const { createOptions } = require('./create-options')

/**
 * Get the instance data
 *
 * @returns {{
 *    browserName: string,
 *    deviceName: string,
 *    logName: string,
 *    name: string,
 *    nativeWebScreenshot: boolean,
 *    platformName: string
 *  }}
 */
function getInstanceData(capabilities) {
  // Substract the needed data from the running instance
  const browserName = (capabilities.browserName || '').toLowerCase()
  const logName =
    capabilities.logName ||
    (capabilities['sauce:options'] ? capabilities['sauce:options'].logName : null) ||
    (capabilities['appium:options'] ? capabilities['appium:options'].logName : null) ||
    (capabilities['wdio-ics:options'] ? capabilities['wdio-ics:options'].logName : null) ||
    ''
  const name = capabilities.name || ''

  // For mobile
  const platformName = (capabilities.platformName || '').toLowerCase()
  const deviceName = (capabilities.deviceName || '').toLowerCase()
  const nativeWebScreenshot = !!capabilities.nativeWebScreenshot

  return {
    browserName,
    deviceName,
    logName,
    name,
    nativeWebScreenshot,
    platformName,
  }
}

// Эти функции исполняются в браузере (и не транспайлятся), поэтому отключаем
// правила линтера, которые преобразовываются var -> const и т. д.
/* eslint-disable no-var, prefer-template, no-param-reassign */
function addClassWhichFixBlinkingCursorsInScreenshot() {
  var style
  if (document.activeElement instanceof HTMLInputElement) {
    if (!document.querySelector('.__blinking-screenshot-fix-style-element')) {
      style = document.createElement('style')
      style.className = '__blinking-screenshot-fix-style-element'
      style.innerHTML = '.__blinking-screenshot-fix { color: transparent; text-shadow: 0 0 0 #000 }'
      document.body.appendChild(style)
    }

    document.activeElement.className =
      (document.activeElement.className || '') + ' __blinking-screenshot-fix'
  }
}

function removeClassWhichFixBlinkingCursorsInScreenshot() {
  document.querySelectorAll('.__blinking-screenshot-fix').forEach(element => {
    element.className = element.className.replace(' __blinking-screenshot-fix', '')
  })

  const style = document.querySelector('.__blinking-screenshot-fix-style-element')
  if (style) {
    document.body.removeChild(style)
  }
}
/* eslint-enable */

function createNotDefinedError(optionName) {
  return new Error(
    `${optionName} is not defined. Define it in your nightwatch.conf.js (https://github.com/Nitive/nightwatch-image-comparison)`
  )
}

function validateGlobalOptions(options) {
  if (!options.testsRootDir) {
    throw createNotDefinedError('testsRootDir')
  }

  if (!options.screenshotsRootDir) {
    throw createNotDefinedError('screenshotsRootDir')
  }
}

function takeScreenshot({ client, description, check, methodOptions, callback }) {
  const globalOptions = client.globals.screenshots || {}
  validateGlobalOptions(globalOptions)

  if (client.globals.skipScreenshotAssertions) {
    console.warn(`Skip screenshot assertion: ${description}`)
    client.perform(() => {
      callback({ status: 'skiped' })
    })
    return
  }

  const instanceData = getInstanceData(client.capabilities)

  const folders = {
    actualFolder: path.join(globalOptions.screenshotsRootDir, 'actual'),
    baselineFolder: path.join(globalOptions.screenshotsRootDir, 'base'),
    diffFolder: path.join(globalOptions.screenshotsRootDir, 'diff'),
  }

  const methods = {
    executor: (fn, ...args) => {
      return new Promise(resolve => {
        client.execute(fn, args, r => {
          resolve(r.value)
        })
      })
    },
    screenShot: () => {
      return new Promise(resolve => {
        client.execute(addClassWhichFixBlinkingCursorsInScreenshot, [], () => {
          client.screenshot(true, res => {
            client.execute(removeClassWhichFixBlinkingCursorsInScreenshot, [], () => {
              resolve(res.value)
            })
          })
        })
      })
    },
  }

  createOptions(client, instanceData.browserName, globalOptions.testsRootDir, methodOptions).then(
    ({ options, allowedMisMatchPercentage }) => {
      return check({
        methods,
        instanceData,
        folders,
        options,
      })
        .then(result => {
          if (addContext && client.currentTest && client.currentTest.mochaTestContext) {
            const ctx = client.currentTest.mochaTestContext

            addContext(ctx, {
              title: 'Скриншот',
              value: result.folders.actual,
            })

            if (result.folders.diff) {
              addContext(ctx, {
                title: 'Базовый скриншот',
                value: result.folders.baseline,
              })
              addContext(ctx, {
                title: 'Разница',
                value: result.folders.diff,
              })
            }
          }

          if (result.misMatchPercentage > allowedMisMatchPercentage / 100) {
            callback({ status: 'error', error: 'Screenshot does not match', result })
            return
          }

          callback({ status: 'success' })
        })
        .catch(error => {
          callback({ status: 'error', error })
        })
    }
  )
}

module.exports = { takeScreenshot }
