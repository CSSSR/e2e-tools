#!/usr/bin/env node
const fs = require('fs')
const yargs = require('yargs')
const { main } = require('@csssr/e2e-tools/src')
const spawnSync = require('cross-spawn').sync

const config = {
  version: '*',
}

main({ yargs, fs, spawnSync, config })
