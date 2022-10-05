function allurectlWatch(config, command) {
  return config.allure?.projectId && config.allure?.mode === 'watch'
    ? `./allurectl watch -- ${command}`
    : command
}

function allurectlUploadStep(config, name, command, type, allureTestOpsJobs) {
  const allureLaunchName =
    type === 'periodic' ? name : `${name} in \${{ github.event.inputs.browserName }}`
  return (
    config.allure?.projectId &&
    config.allure?.mode !== 'watch' && {
      if: 'always()',
      name: 'Upload allure reports to TestOps',
      'working-directory': 'e2e-tests',
      run: `./allurectl upload ${resultsDirectory(command)}`,
      env: {
        ...allureEnv(config, allureLaunchName, command, allureTestOpsJobs),
      },
    }
  )
}

function resultsDirectory(command) {
  return `${command.includes('nightwatch') ? 'nightwatch' : 'codecept'}/report/allure-reports/`
}

function allureEnv(config, name, command, allureTestOpsJobs) {
  function getGitHubEnv(env) {
    return Object.entries(env || {}).reduce((acc, [envName, env]) => {
      const envValue =
        env.type === 'github'
          ? `\${{ secrets.${envName} || '${env.default}' }}`
          : `\${{ github.event.inputs.${envName} }}`

      return {
        ...acc,
        [envName]: envValue,
      }
    }, {})
  }

  return (
    config.allure?.projectId && {
      ALLURE_ENDPOINT: '${{ secrets.ALLURE_ENDPOINT }}',
      ALLURE_TOKEN: '${{ secrets.ALLURE_TOKEN }}',
      ALLURE_PROJECT_ID: config.allure?.projectId,
      ALLURE_JOB_UID: '${{steps.allure-job-uid.outputs.result}}',
      ALLURE_CI_TYPE: 'github',
      ALLURE_LAUNCH_NAME: name,
      ALLURE_RESULTS: resultsDirectory(command),
      ...(allureTestOpsJobs && {
        ALLURE_JOB_RUN_ID: '${{ github.event.inputs.ALLURE_JOB_RUN_ID }}',
        launchUrl: '${{ github.event.inputs.launchUrl }}',
        browserName: '${{ github.event.inputs.browserName }}',
        ...(command.includes('nightwatch') && {
          checkScreenshots: '${{ github.event.inputs.checkScreenshots }}',
        }),
        ...getGitHubEnv(config.env),
      }),
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

function allureJobUidStep() {
  function deindent(s) {
    const lines = s.split('\n').filter((line, index, lines) => {
      const isFirstOrLastLine = index === 0 || index === lines.length - 1
      return !(isFirstOrLastLine && line.trim() === '')
    })

    const indents = lines.filter(Boolean).map((line) => line.length - line.trimLeft().length)
    const minIndent = Math.min(...indents)
    const linesWithoutIndent = lines.map((line) => (line[0] === ' ' ? line.slice(minIndent) : line))
    return linesWithoutIndent.join('\n')
  }

  return {
    uses: 'actions/github-script@v6',
    id: 'allure-job-uid',
    with: {
      'result-encoding': 'string',
      script: deindent(`
      const result = await github.rest.actions.getWorkflowRun({
          owner: context.repo.owner,
          repo: context.repo.repo,
          run_id: context.runId,
        });
      return \`\${context.repo.owner}/\${context.repo.repo}/actions/workflows/\${result.data.workflow_id}\``),
    },
  }
}

function allureTestPlanStep(config) {
  return (
    config.allure?.projectId && {
      name: 'Download allure test-plan',
      'working-directory': 'e2e-tests',
      run: './allurectl job-run plan --output-file ${ALLURE_TESTPLAN_PATH}',
      env: {
        ALLURE_ENDPOINT: '${{ secrets.ALLURE_ENDPOINT }}',
        ALLURE_TOKEN: '${{ secrets.ALLURE_TOKEN }}',
        ALLURE_PROJECT_ID: config.allure?.projectId,
        ALLURE_JOB_RUN_ID: '${{ github.event.inputs.ALLURE_JOB_RUN_ID }}',
        ALLURE_TESTPLAN_PATH: './testplan.json',
      },
    }
  )
}

module.exports = {
  allurectlWatch,
  allurectlUploadStep,
  allureEnv,
  downloadAllurectlStep,
  allureJobUidStep,
  allureTestPlanStep,
}
