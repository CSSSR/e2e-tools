#!/usr/bin/env node
const fs = require('fs')
const yargs = require('yargs')
const inquirer = require('inquirer')
const spawnSync = require('cross-spawn').sync
const { main } = require('../src')

const yarn = {
  install({ cwd, frozenLockfile }) {
    spawnSync(`yarn install${frozenLockfile ? ' --frozen-install' : ''}`, {
      cwd,
      stdio: 'inherit',
    })
  },
  add({ dev, tilde, packageName, version, cwd }) {
    const args = [
      'add',
      dev && '--dev',
      tilde && '--tilde',
      `${packageName}${version ? '@version' : ''}`,
    ].filter(Boolean)

    console.log('yarn', args.join(' '))
    spawnSync('yarn', args, {
      cwd,
      stdio: 'inherit',
    })
  },
  run(cmd, { cwd }) {
    spawnSync('yarn', ['run', cmd], {
      cwd,
      stdio: 'inherit',
    })
  },
}

function nightwatch(args, { cwd }) {
  return spawnSync('yarn', args, { cwd, stdio: 'inherit' })
}

async function prompt(question) {
  const answers = await inquirer.prompt([question])

  return answers[question.name]
}

main({
  cwd: process.cwd(),
  fs,
  require,
  yarn,
  prompt,
  yargs,
  nightwatch,
  process,
  getPackageInfo: require('package-info'),
  getLocalPackageInfo(packageName) {
    return require(`${packageName}/package.json`)
  },
})
