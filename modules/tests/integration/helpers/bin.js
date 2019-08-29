#!/usr/bin/env node
const fs = require('fs')
const yargs = require('yargs')
const spawnSync = require('cross-spawn').sync
const { main } = require('@nitive/e2e-tools/src')

const config = {
  version: `file:${__dirname.replace('tests/integration/helpers', 'tools')}`,
}

const inquirer = {
  async prompt() {
    const results = yargs.argv.promptResults
    if (typeof results === 'string') {
      return JSON.parse(results)
    } else {
      return {}
    }
  },
}

main({ yargs, fs, spawnSync, config, inquirer })
