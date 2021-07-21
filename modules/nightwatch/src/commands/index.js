const { addNightwatchRunCommand } = require('./run')
const { addNightwatchAddBrowserCommand } = require('./add-browser')

function getCommands(context) {
  return [addNightwatchRunCommand(context), addNightwatchAddBrowserCommand(context)].filter(Boolean)
}

module.exports = { getCommands }
