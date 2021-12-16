function allurectlWatch(config, command) {
  return config.allure?.projectId && config.allure?.mode === 'watch'
    ? `./allurectl watch -- ${command}`
    : command
}

function allurectlUploadStep(config, name, command) {
  return (
    config.allure?.projectId &&
    config.allure?.mode !== 'watch' && {
      if: 'always()',
      name: 'Upload allure reports to TestOps',
      'working-directory': 'e2e-tests',
      run: `./allurectl upload ${resultsDirectory(command)}`,
      env: {
        ...allureEnv(config, `${name} in \${{ github.event.inputs.browserName }}`, command),
      },
    }
  )
}

function resultsDirectory(command) {
  return `${command.includes('nightwatch') ? 'nightwatch' : 'codecept'}/report/allure-reports/`
}

function allureEnv(config, name, command) {
  return (
    config.allure?.projectId && {
      ALLURE_ENDPOINT: '${{ secrets.ALLURE_ENDPOINT }}',
      ALLURE_TOKEN: '${{ secrets.ALLURE_TOKEN }}',
      ALLURE_PROJECT_ID: config.allure?.projectId,
      ALLURE_JOB_UID: '${{ github.run_id }}',
      ALLURE_CI_TYPE: 'github',
      ALLURE_LAUNCH_NAME: name,
      ALLURE_RESULTS: resultsDirectory(command),
    }
  )
}

function downloadAllurectlStep() {
  return {
    name: 'Download allurectl',
    'working-directory': 'e2e-tests',
    run: [
      'wget https://github.com/allure-framework/allurectl/releases/latest/download/allurectl_linux_386 -O ./allurectl',
      'chmod +x ./allurectl\n',
    ].join('\n'),
  }
}

module.exports = { allurectlWatch, allurectlUploadStep, allureEnv, downloadAllurectlStep }
