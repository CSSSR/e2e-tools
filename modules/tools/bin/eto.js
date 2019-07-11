#!/usr/bin/env node
const fs = require('fs')
const yargs = require('yargs')
const { main } = require('../src')

main({ yargs, fs })
