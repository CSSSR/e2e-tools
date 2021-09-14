'use strict'

const parserOpts = require('./parser-opts')

const levels = {
  major: 0,
  minor: 1,
  patch: 2,
}

module.exports = {
  parserOpts,

  whatBump: (commits) => {
    const bumps = commits.map((commit) => {
      const bodyLines = (commit.body || '').toLowerCase().split('\n').filter(Boolean)
      if (bodyLines.includes('bump major')) {
        return levels.major
      }
      if (bodyLines.includes('bump minor')) {
        return levels.minor
      }

      return levels.patch
    })

    const majorBumps = bumps.filter((bump) => bump === levels.major).length
    const minorBumps = bumps.filter((bump) => bump === levels.minor).length

    return {
      level: Math.min(...bumps),
      reason: `There are ${majorBumps} major bumps and ${minorBumps} minor bumps`,
    }
  },
}
