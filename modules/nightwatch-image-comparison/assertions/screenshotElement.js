const checkElement = require('webdriver-image-comparison/build/commands/checkElement').default
const { takeScreenshot } = require('../utils/take-screenshot')
const { addAssertionMethods } = require('../utils/screenshot-assertion')
const { getElement } = require('../utils/elements')

exports.assertion = function screenshotElement(selector, description, methodOptions = {}) {
  addAssertionMethods(this, description)

  this.command = function screenshotElementCommand(callback) {
    takeScreenshot({
      client: this.api,
      description,
      methodOptions,
      check: async ({ methods, instanceData, folders, options }) => {
        const element = await getElement(this.api, selector)
        return checkElement(methods, instanceData, folders, element, description, options)
      },
      callback,
    })

    return this
  }
}
