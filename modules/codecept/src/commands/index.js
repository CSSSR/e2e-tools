const { addRunCommand } = require('./run')

function getCommands(context) {
  return [addRunCommand(context)].filter(Boolean)
}

module.exports = { getCommands }
