const { addNightwatchRunCommand } = require('./nightwatch-run')
const { addNightwatchAddBrowserCommand } = require('./add-browser')

function getCommands(context) {
  return [addNightwatchRunCommand(context), addNightwatchAddBrowserCommand(context)].filter(Boolean)
}

module.exports = { getCommands }
