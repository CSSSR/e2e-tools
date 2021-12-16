const fs = require('fs')
const path = require('path')
const glob = require('fast-glob')
const {
  getConfig,
  getProjectRootDir,
  createWorkflow,
  getGitHubSecretEnv,
  allurectlWatch,
  allurectlUploadStep,
  allureEnv,
  downloadAllurectlStep,
} = require('../utils')

function getWorkflowName({ url, command, run }) {
  let name = `${run.name} (url: ${url}, command: ${command})`
  if (name.length > 120) {
    if (run.name.length > 120) {
      throw new Error('Workflow name too long, should be less than 120 symbols')
    }
    return run.name
  }
  return name
}

function getCheckoutSteps(run) {
  if (run.testsBranch) {
    if (run.customEvent === 'successful-deploy') {
      return [
        {
          uses: 'actions/checkout@v2',
          with: {
            lfs: true,
            ref: run.testsBranch,
          },
        },
      ]
    }

    return [
      {
        uses: 'actions/checkout@v2',
        with: {
          lfs: true,
          ref: run.testsBranch,
        },
        if: `github.event_name != 'workflow_dispatch'`,
      },
      {
        uses: 'actions/checkout@v2',
        with: {
          lfs: true,
        },
        if: `github.event_name == 'workflow_dispatch'`,
      },
    ]
  }

  return [
    {
      uses: 'actions/checkout@v2',
      with: {
        lfs: true,
      },
    },
  ]
}

function generatePeriodicRunWorkflow({ url, command, run, id, config }) {
  const workflowPath = path.join(
    getProjectRootDir(),
    `.github/workflows/e2e-run-periodic-task-${id}.yaml`
  )

  const workflowName = getWorkflowName({ url, command, run })

  function slackMessage(status) {
    function byStatus(success, failure) {
      return status === 'success' ? success : failure
    }

    return {
      'slack-bot-user-oauth-access-token': '${{ secrets.SLACK_SEND_MESSAGE_TOKEN }}',
      'slack-channel': run.slackChannel,
      'slack-text': [
        byStatus(
          ':approved: *Тесты прошли успешно*',
          ':fire: *${{ steps.allure.outputs.report-failed-percentage }}% (${{ steps.allure.outputs.report-failed-total }}) тестов упало*'
        ),
        '',
        `Название: ${run.name}`,
        `URL: ${url}`,
        'Команда для запуска:',
        '```',
        command,
        '```',
        '',
        '*Allure отчёт*: ${{ steps.allure.outputs.report-link }}',
        '',
        '${{ steps.allure.outputs.report-summary }}',
        '',
        'Логи: https://github.com/${{ github.repository }}/runs/${{ steps.query-jobs.outputs.result }}?check_suite_focus=true',
        '',
        `https://s.csssr.ru/U09LGPMEU/${byStatus(
          '20200731115845',
          '20200731115800'
        )}.jpg?run=\${{ github.run_id }}`,
      ].join('\n'),
    }
  }

  const workflow = {
    name: workflowName,
    concurrency: 'e2e-tests',
    on: {
      ...run.event,
      workflow_dispatch: {},
    },
    permissions: {
      actions: 'read',
      checks: 'none',
      contents: 'read',
      deployments: 'none',
      issues: 'none',
      packages: 'none',
      'pull-requests': 'none',
      'repository-projects': 'none',
      'security-events': 'none',
      statuses: 'none',
    },
    jobs: {
      'run-tests': {
        name: 'Run tests',
        'runs-on': ['self-hosted', 'e2e-tests'],
        'timeout-minutes': 90,
        steps: [
          ...getCheckoutSteps(run),
          {
            run: 'yarn install --frozen-lockfile',
            'working-directory': 'e2e-tests',
          },
          config.allure?.projectId && downloadAllurectlStep(),
          {
            run: allurectlWatch(config, command),
            'working-directory': 'e2e-tests',
            env: {
              ...getGitHubSecretEnv(config.tools['@csssr/e2e-tools-nightwatch']?.browsers),
              ...getGitHubSecretEnv(config.tools['@csssr/e2e-tools-codecept']?.browsers),
              LAUNCH_URL: url,
              ENABLE_ALLURE_REPORT: 'true',
              ...allureEnv(config, run.name, command),
            },
          },
          {
            if: 'always()',
            name: 'Generate Allure report',
            run: `node -e 'require("@csssr/e2e-tools/upload-allure-report")'`,
            'working-directory': 'e2e-tests',
            id: 'allure',
            env: {
              LAUNCH_URL: url,
              RUN_COMMAND: command,
              ALLURE_REPORT_DIRECTORIES:
                'codecept/report/allure-reports/,nightwatch/report/allure-reports/',
              AWS_ACCESS_KEY_ID: '${{ secrets.TEST_REPORTS_AWS_ACCESS_KEY_ID }}',
              AWS_SECRET_ACCESS_KEY: '${{ secrets.TEST_REPORTS_AWS_SECRET_ACCESS_KEY }}',
            },
          },
          run.slackChannel && {
            if: 'always()',
            uses: 'actions/github-script@v4',
            id: 'query-jobs',
            with: {
              script: [
                'const result = await github.actions.listJobsForWorkflowRun({',
                '  owner: context.repo.owner,',
                '  repo: context.repo.repo,',
                '  run_id: ${{ github.run_id }},',
                '})',
                'return result.data.jobs[0].id',
              ].join('\n'),
              'result-encoding': 'string',
            },
          },

          run.slackChannel && {
            if: 'failure()',
            name: 'Send failure to Slack',
            uses: 'archive/github-actions-slack@27663f2377ce6f86d7fca5b8056e6b977f03b5c9',
            with: slackMessage('failure'),
          },
          run.slackChannel && {
            if: 'success()',
            name: 'Send success to Slack',
            uses: 'archive/github-actions-slack@27663f2377ce6f86d7fca5b8056e6b977f03b5c9',
            with: slackMessage('success'),
          },
          allurectlUploadStep(config, run.name, command),
        ].filter(Boolean),
      },
    },
  }

  if (run.customEvent === 'successful-deploy') {
    workflow.on = {
      deployment_status: {},
    }

    workflow.jobs['run-tests'].if = [
      `github.event_name == 'workflow_dispatch' ||`,
      `github.event_name == 'deployment_status' &&`,
      `github.event.deployment_status.state == 'success' &&`,
      `github.event.deployment.payload.environmentURL == '${url}'`,
    ].join(' ')
  }

  /*
    Событие workflow_run происходит когда процесс изменяет статус 
    на requested или completed Но статус completed не указывает на успех 
    выполнения процесса. Для отсеивания процессов что не завершились успешно 
    нам необходимо добавить следующее условие:
  */
  if (run.event && run.event.workflow_run) {
    workflow.jobs['run-tests'].if = `github.event.workflow_run.conclusion == 'success'`
  }

  createWorkflow(workflowPath, workflow)
}

function validatePeriodicRunsConfig(periodicRuns) {
  periodicRuns.forEach((run) => {
    if (!run.event && !run.customEvent) {
      throw new Error('Either event or customEvent for periodic run should be defined')
    }

    if (run.event && run.customEvent) {
      throw new Error('Either event on customEvent for periodic run should be defined, not both')
    }

    if (run.customEvent && !['successful-deploy'].includes(run.customEvent)) {
      throw new Error(`Unexpected customEvent = “${run.customEvent}”`)
    }
  })
}

function createPeriodicRunsWorkflows(config) {
  const periodicRuns = config.periodicRuns || []
  validatePeriodicRunsConfig(periodicRuns)
  let id = 1
  const generatedWorkflows = []

  periodicRuns.forEach((run) => {
    run.urls.forEach((url) => {
      run.commands.forEach((command) => {
        console.log(`Generating workflow “${getWorkflowName({ url, command, run })}”`)
        generatePeriodicRunWorkflow({ url, command, run, id, config })
        generatedWorkflows.push(`e2e-run-periodic-task-${id}.yaml`)
        id++
      })
    })
  })

  const workflowsRoot = path.join(getProjectRootDir(), `.github/workflows`)
  const workflowsFileNames = glob.sync(`e2e-run-periodic-task-*.yaml`, {
    cwd: workflowsRoot,
  })

  let removedCount = 0
  workflowsFileNames.forEach((workflowFileName) => {
    if (!generatedWorkflows.includes(workflowFileName)) {
      console.log(`Removing ${workflowFileName}`)
      fs.rmSync(path.join(workflowsRoot, workflowFileName), { force: true })
      removedCount++
    }
  })

  console.log(`Done. Generated: ${generatedWorkflows.length}, removed: ${removedCount}`)
}

const generatePeriodicRunsCommand = () => ({
  command: 'generate-periodic-runs',
  describe: 'Generate periodic runs as GitHub Workflow files',
  handler() {
    const config = getConfig()
    createPeriodicRunsWorkflows(config)
  },
})

module.exports = { generatePeriodicRunsCommand, createPeriodicRunsWorkflows }
