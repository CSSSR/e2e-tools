function allurectlWatch(projectId, command) {
  return projectId ? `./allurectl watch -- ${command}` : command
}

function allureEnv(projectId, name, command) {
  return (
    projectId && {
      ALLURE_ENDPOINT: '${{ secrets.ALLURE_ENDPOINT }}',
      ALLURE_TOKEN: '${{ secrets.ALLURE_TOKEN }}',
      ALLURE_PROJECT_ID: projectId,
      ALLURE_JOB_UID: '${{ github.run_id }}',
      ALLURE_CI_TYPE: 'github',
      ALLURE_LAUNCH_NAME: name,
      ALLURE_RESULTS: `${
        command.includes('nightwatch') ? 'nightwatch' : 'codecept'
      }/report/allure-reports/`,
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

module.exports = { allurectlWatch, allureEnv, downloadAllurectlStep }
