#!/usr/bin/env node
const fs = require('fs')
const yargs = require('yargs')
const { main } = require('../src')
const spawnSync = require('cross-spawn').sync
const e2eToolsPackage = require('../package.json')

const config = {
  version: e2eToolsPackage.version,
}

main({ yargs, fs, spawnSync, config })
