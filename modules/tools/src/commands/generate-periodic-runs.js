const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const glob = require('fast-glob')
const { getConfig, getProjectRootDir, createWorkflow, getGitHubSecretEnv } = require('../utils')

function getWorkflowName({ url, command, run }) {
  return `${run.name} (url: ${url}, command: ${command})`
}

function generatePeriodicRunWorkflow({ url, command, run, id, config }) {
  const workflowPath = path.join(
    getProjectRootDir(),
    `.github/workflows/e2e-run-periodic-task-${id}.yaml`
  )

  const workflowName = getWorkflowName({ url, command, run })

  const workflow = {
    name: workflowName,
    concurrency: 'e2e-tests',
    on: {
      ...run.event,
      workflow_dispatch: {},
    },
    permissions: {
      actions: 'none',
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
          {
            uses: 'actions/checkout@v2',
            with: {
              lfs: true,
            },
          },
          {
            run: 'yarn install --frozen-lockfile',
            'working-directory': 'e2e-tests',
          },
          {
            run: command,
            'working-directory': 'e2e-tests',
            env: {
              ...getGitHubSecretEnv(config.tools['@csssr/e2e-tools-nightwatch']?.browsers),
              ...getGitHubSecretEnv(config.tools['@csssr/e2e-tools-codecept']?.browsers),
              LAUNCH_URL: url,
            },
          },
          run.slackChannel && {
            if: 'failure()',
            name: 'Send failure to Slack',
            uses: 'archive/github-actions-slack@27663f2377ce6f86d7fca5b8056e6b977f03b5c9',
            with: {
              'slack-bot-user-oauth-access-token': '${{ secrets.SLACK_SEND_MESSAGE_TOKEN }}',
              'slack-channel': 'C0129A519T8',
              'slack-text': [
                ':fire: Тесты упали',
                workflowName,
                'Логи: https://github.com/${{ github.repository }}/runs/${{ github.job_id }}?check_suite_focus=true',
                'https://s.csssr.ru/U09LGPMEU/20200731115800.jpg?run=${{ github.run_id }}',
              ].join('\n'),
            },
          },
          run.slackChannel && {
            if: 'success()',
            name: 'Send success to Slack',
            uses: 'archive/github-actions-slack@27663f2377ce6f86d7fca5b8056e6b977f03b5c9',
            with: {
              'slack-bot-user-oauth-access-token': '${{ secrets.SLACK_SEND_MESSAGE_TOKEN }}',
              'slack-channel': 'C0129A519T8',
              'slack-text': [
                ':approve: Тесты прошли успешно',
                workflowName,
                'Логи: https://github.com/${{ github.repository }}/runs/${{ github.job_id }}?check_suite_focus=true',
                'https://s.csssr.ru/U09LGPMEU/20200731115845.jpg?run=${{ github.run_id }}',
              ].join('\n'),
            },
          },
        ].filter(Boolean),
      },
    },
  }

  if (run.customEvent === 'successful-deploy') {
    workflow.on = {
      deployment_status: {},
    }

    workflow.jobs['run-tests'].if = [
      `github.event_name === "workflow_dispatch" ||`,
      `github.event_name === "deployment_status" &&`,
      `github.event.deployment_status.state == 'success' && `,
      `github.event.deployment.payload.environmentURL == '${url}'`,
    ].join('')
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
  const workflowsFileNames = glob.sync(`*.yaml`, {
    cwd: workflowsRoot,
  })

  let removedCount = 0
  workflowsFileNames.forEach((workflowFileName) => {
    if (!generatedWorkflows.includes(workflowFileName)) {
      console.log(`Removing ${workflowFileName}`)
      fs.rmSync(workflowFileName, { force: true })
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

module.exports = { generatePeriodicRunsCommand }
