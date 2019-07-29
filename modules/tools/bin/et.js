#!/usr/bin/env node
const fs = require('fs')
const yargs = require('yargs')
const inquirer = require('inquirer')
const spawnSync = require('cross-spawn').sync
const e2eToolsPackage = require('../package.json')
const { main } = require('../src')

const config = {
  version: `~${e2eToolsPackage.version}`,
}

main({ yargs, fs, spawnSync, config, inquirer })
