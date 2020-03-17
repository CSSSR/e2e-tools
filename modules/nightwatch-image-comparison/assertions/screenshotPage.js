const checkFullPageScreen = require('webdriver-image-comparison/build/commands/checkFullPageScreen')
  .default
const { takeScreenshot } = require('../utils/take-screenshot')
const { addAssertionMethods } = require('../utils/screenshot-assertion')

exports.assertion = function screenshotPage(description, methodOptions) {
  addAssertionMethods(this, description)

  this.command = async function screenshotPageCommand(callback) {
    takeScreenshot({
      client: this.api,
      description,
      methodOptions,
      check({ methods, instanceData, folders, options }) {
        return checkFullPageScreen(methods, instanceData, folders, description, options)
      },
      callback,
    })

    return this
  }
}
